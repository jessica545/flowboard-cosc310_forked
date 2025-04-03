/* eslint-disable @typescript-eslint/no-unused-vars */
import { Hono } from "hono";
import { getMember } from "@/features/members/utils";
import { zValidator } from "@hono/zod-validator";
import { createTaskSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, TASKS_ID, MEMBERS_ID, PROJECTS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { TaskStatus, Task } from "../types";
import { Project } from "@/features/projects/types";
import { createAdminClient } from "@/lib/appwrite";

const app = new Hono();

app.get(
  "/",
  sessionMiddleware,
  zValidator(
    "query",
    z.object({
      workspaceId: z.string(),
      projectId: z.string().nullish(),
      assigneeId: z.string().nullish(),
      status: z.nativeEnum(TaskStatus).nullish(),
      search: z.string().nullish(),
      dueDate: z.string().nullish(),
    })
  ),
  async (c) => {
    const { users } = await createAdminClient();
    const databases = c.get("databases");
    const user = c.get("user");

    const { workspaceId, projectId, status, search, assigneeId, dueDate } = c.req.valid("query");

    const member = await getMember({ databases, workspaceId, userId: user.$id });
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    const query = [Query.equal("workspaceId", workspaceId), Query.orderDesc("$createdAt")];
    if (projectId !== null && projectId !== undefined) query.push(Query.equal("projectId", projectId));
    if (status !== null && status !== undefined) {
      console.log('Applying status filter:', status);
      query.push(Query.equal("status", status));
    }
    if (assigneeId !== null && assigneeId !== undefined) query.push(Query.equal("assigneeId", assigneeId));
    if (dueDate !== null && dueDate !== undefined) query.push(Query.equal("dueDate", dueDate));
    if (search !== null && search !== undefined && search !== '') query.push(Query.search("name", search));

    console.log('Tasks query:', query);
    console.log('Status value:', status);
    console.log('Status type:', typeof status);

    const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, query);
    const projectIds = tasks.documents.map((task) => task.projectId);
    const assigneeIds = tasks.documents.map((task) => task.assigneeId);
    const assignedToIds = tasks.documents.map((task) => task.assignedToId).filter(Boolean);

    const projects = await databases.listDocuments<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
    );

    const memberIds = [...new Set([...assigneeIds, ...assignedToIds])];
    const members = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      memberIds.length > 0 ? [Query.contains("$id", memberIds.filter(id => id !== undefined))] : []
    );

    const memberDetails = await Promise.all(
      (members?.documents || []).map(async (member) => {
        try {
          const user = await users.get(member.userId);
          return { ...member, name: user.name, email: user.email };
        } catch {
          return {
            ...member,
            name: member.name || `User ${member.userId.substring(0, 8)}`,
            email: "unknown@example.com",
          };
        }
      })
    );

    const populatedTasks = tasks.documents.map((task) => {
      const project = projects.documents.find((proj) => proj.$id === task.projectId);
      const assignee = memberDetails.find((mem) => mem.$id === task.assigneeId);
      const assignedTo = task.assignedToId ? memberDetails.find((mem) => mem.$id === task.assignedToId) : null;
      return { ...task, project, assignee, assignedTo };
    });

    return c.json({ data: { ...tasks, documents: populatedTasks } });
  }
);

app.post(
  "/",
  sessionMiddleware,
  zValidator("json", createTaskSchema),
  async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");

    const { name, status, workspaceId, projectId, dueDate, assigneeId, assignedToId } = c.req.valid("json");
    const member = await getMember({ databases, workspaceId, userId: user.$id });
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    const highestPositionTask = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("status", status),
      Query.equal("workspaceId", workspaceId),
      Query.orderAsc("position"),
      Query.limit(1),
    ]);

    const newPosition = highestPositionTask.documents.length > 0
      ? highestPositionTask.documents[0].position + 1000
      : 1000;

    const task = await databases.createDocument(DATABASE_ID, TASKS_ID, ID.unique(), {
      name,
      status,
      workspaceId,
      projectId,
      dueDate,
      assigneeId,
      assignedToId,
      position: newPosition,
    });

    return c.json({ data: task });
  }
);

app.patch(
  "/:taskId",
  sessionMiddleware,
  zValidator("json", createTaskSchema.partial()),
  async (c) => {
    try {
      const user = c.get("user");
      const databases = c.get("databases");
      const { taskId } = c.req.param();
      
      if (!taskId) {
        console.error("Task ID is missing in update request");
        return c.json({ error: "Task ID is required" }, 400);
      }
      
      // Get valid fields from request body
      const updates = c.req.valid("json");
      const { name, status, description, projectId, dueDate, assigneeId, assignedToId } = updates;
      
      console.log(`Updating task ${taskId}, fields:`, updates);
      
      // Get the existing task
      let existingTask;
      try {
        existingTask = await databases.getDocument<Task>(DATABASE_ID, TASKS_ID, taskId);
      } catch (error: any) {
        console.error(`Error fetching task ${taskId} for update:`, error);
        return c.json({ error: "Task not found", details: error.message || String(error) }, 404);
      }
      
      // Check authorization
      const member = await getMember({ databases, workspaceId: existingTask.workspaceId, userId: user.$id });
      if (!member) {
        console.error(`User ${user.$id} not authorized to update task in workspace ${existingTask.workspaceId}`);
        return c.json({ error: "Unauthorized" }, 401);
      }
      
      // Create update object with only the fields that were provided
      const updateData: any = {};
      
      // Only include fields that were explicitly provided in the request
      if (name !== undefined) updateData.name = name;
      if (status !== undefined) updateData.status = status;
      if (description !== undefined) updateData.description = description;
      if (projectId !== undefined) updateData.projectId = projectId;
      if (dueDate !== undefined) updateData.dueDate = dueDate;
      if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
      if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
      
      // Always include workspaceId to maintain consistency
      updateData.workspaceId = existingTask.workspaceId;
      
      console.log("Applying task updates:", updateData);
      
      // Update the task with only the provided fields
      const task = await databases.updateDocument<Task>(
        DATABASE_ID, 
        TASKS_ID, 
        taskId, 
        updateData
      );
      
      console.log(`Task ${taskId} updated successfully`);
      return c.json({ data: task });
    } catch (error: any) {
      console.error("Error updating task:", error);
      return c.json({ 
        error: "Failed to update task", 
        details: error.message || String(error) 
      }, 500);
    }
  }
);

app.delete(
  "/:taskId",
  sessionMiddleware,
  async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(DATABASE_ID, TASKS_ID, taskId);
    const member = await getMember({ databases, workspaceId: task.workspaceId, userId: user.$id });
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);

    return c.json({ data: { $id: task.$id } });
  }
);

app.get(
  "/:taskId",
  sessionMiddleware,
  async (c) => {
    try {
      const currentUser = c.get("user");
      const databases = c.get("databases");
      const { users } = await createAdminClient();
      const { taskId } = c.req.param();

      console.log(`Retrieving task with ID: ${taskId}, requested by user: ${currentUser.$id}`);
      
      if (!taskId) {
        console.error('Task ID is missing in request');
        return c.json({ error: "Task ID is required" }, 400);
      }

      // Try to get the task
      let task;
      try {
        task = await databases.getDocument<Task>(DATABASE_ID, TASKS_ID, taskId);
      } catch (error: any) {
        console.error(`Error fetching task ${taskId}:`, error);
        return c.json({ error: "Task not found", details: error.message || String(error) }, 404);
      }

      if (!task) {
        console.error(`Task ${taskId} not found`);
        return c.json({ error: "Task not found" }, 404);
      }

      // Check member authorization
      let currentMember;
      try {
        currentMember = await getMember({ databases, workspaceId: task.workspaceId, userId: currentUser.$id });
      } catch (error: any) {
        console.error(`Error checking membership for user ${currentUser.$id} in workspace ${task.workspaceId}:`, error);
        return c.json({ error: "Error checking authorization", details: error.message || String(error) }, 500);
      }

      if (!currentMember) {
        console.error(`User ${currentUser.$id} not authorized for workspace ${task.workspaceId}`);
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Get the project
      let project;
      try {
        project = await databases.getDocument<Project>(DATABASE_ID, PROJECTS_ID, task.projectId);
      } catch (error) {
        console.error(`Error fetching project ${task.projectId}:`, error);
        project = null; // Continue with null project rather than failing the whole request
      }

      // Get assignee details
      let assignee = null;
      try {
        const assigneeMember = await databases.getDocument(DATABASE_ID, MEMBERS_ID, task.assigneeId);
        const assigneeUser = await users.get(assigneeMember.userId);
        assignee = { 
          ...assigneeMember, 
          name: assigneeUser.name, 
          email: assigneeUser.email,
          imageUrl: assigneeUser.prefs?.avatar || '/path/to/default-avatar.png'
        };
      } catch (error) {
        console.error(`Error fetching assignee details for ${task.assigneeId}:`, error);
        assignee = null; // Continue with null assignee
      }

      // Get assignedTo details if it exists
      let assignedTo = null;
      if (task.assignedToId) {
        try {
          const assignedToMember = await databases.getDocument(DATABASE_ID, MEMBERS_ID, task.assignedToId);
          const assignedToUser = await users.get(assignedToMember.userId);
          assignedTo = { 
            ...assignedToMember, 
            name: assignedToUser.name,
            email: assignedToUser.email,
            imageUrl: assignedToUser.prefs?.avatar || '/path/to/default-avatar.png'
          };
        } catch (error) {
          console.error(`Error fetching assignedTo details for ${task.assignedToId}:`, error);
        }
      }

      console.log(`Successfully retrieved task ${taskId} for user ${currentUser.$id}`);

      // Return the populated task data
      return c.json({ 
        data: { 
          ...task, 
          project, 
          assignee,
          assignedTo 
        } 
      });
    } catch (error: any) {
      console.error('Unexpected error in task retrieval:', error);
      return c.json({ error: "Internal server error", details: error.message || String(error) }, 500);
    }
  }
);

export default app;
