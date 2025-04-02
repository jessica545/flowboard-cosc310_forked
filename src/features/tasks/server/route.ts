/* eslint-disable @typescript-eslint/no-unused-vars */
import { Hono } from "hono";
import { getMember } from "@/features/members/utils";
import { zValidator } from "@hono/zod-validator";
import { createTaskSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, TASKS_ID, MEMBERS_ID, PROJECTS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { TaskStatus, Task } from "../types"; // Fixed relative import path
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

    // Log request parameters for debugging
    console.log("TASK API REQUEST:", { 
      workspaceId, 
      projectId: projectId || "none", 
      status: status || "none", 
      assigneeId: assigneeId || "none" 
    });

    const member = await getMember({ databases, workspaceId, userId: user.$id });
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    const query = [Query.equal("workspaceId", workspaceId), Query.orderDesc("$createdAt")];
    
    // CRITICAL CHANGE: Make sure projectId is properly handled
    if (projectId && projectId !== "undefined" && projectId !== "null") {
      console.log(`Adding project filter: projectId = ${projectId}`);
      query.push(Query.equal("projectId", projectId));
    } else {
      console.log("No project filter applied");
    }
    
    if (status) query.push(Query.equal("status", status));
    if (assigneeId) query.push(Query.equal("assigneeId", assigneeId));
    if (dueDate) query.push(Query.equal("dueDate", dueDate));
    if (search) query.push(Query.search("name", search));

    console.log("Final query filters:", JSON.stringify(query, null, 2));

    const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, query);
    console.log(`Found ${tasks.documents.length} tasks matching query`);
    
    if (projectId) {
      console.log(`Tasks for project ${projectId}:`, tasks.documents.map(t => ({ id: t.$id, name: t.name, projectId: t.projectId })));
    }

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
      members.documents.map(async (member) => {
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
    const { name, status, workspaceId, projectId, dueDate, assigneeId, assignedToId } = c.req.valid("json") as {
      name: string;
      status: string;
      workspaceId: string;
      projectId: string;
      dueDate: string;
      assigneeId: string;
      assignedToId?: string;
    };
    const member = await getMember({ databases, workspaceId, userId: user.$id });
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    const highestPositionTask = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("status", status as string),
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
    const user = c.get("user");
    const databases = c.get("databases");
    const { taskId } = c.req.param();
    const { name, status, description, projectId, dueDate, assigneeId, assignedToId } = c.req.valid("json");

    const existingTask = await databases.getDocument<Task>(DATABASE_ID, TASKS_ID, taskId);
    const member = await getMember({ databases, workspaceId: existingTask.workspaceId, userId: user.$id });
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    const task = await databases.updateDocument<Task>(DATABASE_ID, TASKS_ID, taskId, {
      name,
      status,
      workspaceId: existingTask.workspaceId,
      projectId,
      dueDate,
      assigneeId,
      assignedToId,
      description,
    });

    return c.json({ data: task });
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
    const currentUser = c.get("user");
    const databases = c.get("databases");
    const { users } = await createAdminClient();
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(DATABASE_ID, TASKS_ID, taskId);
    const currentMember = await getMember({ databases, workspaceId: task.workspaceId, userId: currentUser.$id });
    if (!currentMember) return c.json({ error: "Unauthorized" }, 401);

    const project = await databases.getDocument<Project>(DATABASE_ID, PROJECTS_ID, task.projectId);
    
    // Get assignee details
    const assigneeMember = await databases.getDocument(DATABASE_ID, MEMBERS_ID, task.assigneeId);
    const assigneeUser = await users.get(assigneeMember.userId);
    const assignee = { ...assigneeMember, name: assigneeUser.name, email: assigneeUser.email };

    // Get assignedTo details if it exists
    let assignedTo = null;
    if (task.assignedToId) {
      try {
        const assignedToMember = await databases.getDocument(DATABASE_ID, MEMBERS_ID, task.assignedToId);
        const assignedToUser = await users.get(assignedToMember.userId);
        assignedTo = { 
          ...assignedToMember, 
          name: assignedToUser.name,
          email: assignedToUser.email
        };
      } catch (error) {
        console.error('Error fetching assignedTo details:', error);
      }
    }

    // Return the populated task data
    return c.json({ 
      data: { 
        ...task, 
        project, 
        assignee: {
          ...assignee,
          imageUrl: assigneeUser.name // Using name as fallback since avatarUrl doesn't exist
        },
        assignedTo 
      } 
    });
  }
);

export default app;
