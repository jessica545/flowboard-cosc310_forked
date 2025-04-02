import {Hono} from "hono";
import {z} from "zod";
import {zValidator} from "@hono/zod-validator";
import {createWorkspaceSchema, updateWorkspaceSchema} from "@/features/workspaces/schemas";
import {sessionMiddleware} from "@/lib/session-middleware";
import {DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID, PROJECTS_ID, TASKS_ID} from "@/config";
import {ID, Query} from "node-appwrite";
import {MemberRole} from "@/features/members/types";
import {generateInviteCode} from "@/lib/utils";
import { getMember } from "@/features/members/utils";
import { Workspace } from "../types";
import { TaskStatus } from "@/features/tasks/types";
import { Project } from "@/features/projects/types";

// Define Task type for workspace analytics
interface Task {
  name: string;
  projectId: string;
  workspaceId: string;
  assignedToId?: string;
  status: TaskStatus;
  dueDate?: string;
  position?: number;
}

const app = new Hono()
    .get("/", sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        const member = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("userId", user.$id)]
        )

        if (member.total == 0) {
            return c.json({data: {documents: [], total: 0}});
        }

        const workspaceIds = member.documents.map((member) => member.workspaceId);


        const workspaces = await databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
            [Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceIds)]
        );

        return c.json({data: workspaces});
    })
    .post("/", zValidator("form", createWorkspaceSchema), sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const storage = c.get("storage");
            const user = c.get("user");

            const {name, image} = c.req.valid("form");

            let uploadedImageUrl: string | undefined;

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image
                );

                const arrayBuffer = await storage.getFilePreview(
                    IMAGES_BUCKET_ID,
                    file.$id,
                );

                uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`
            }

            const workspace = await databases.createDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                ID.unique(),
                {
                    name,
                    userId: user.$id,
                    imageUrl: uploadedImageUrl,
                    inviteCode:generateInviteCode(6),
                },
            )

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId: workspace.$id,
                    role: MemberRole.ADMIN,
                    name: user.name,
                },
            )


            return c.json({data: workspace});
        }
    )
;

// Update workspace details
app.patch(
    "/:workspaceId", 
    sessionMiddleware,
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");
      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid("form");
      const member = await getMember({
        databases,
        workspaceId, 
        userId: user.$id,
      });
      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      let uploadedImageUrl: string | undefined;
      if (image instanceof File) {
        const file = await storage.createFile(IMAGES_BUCKET_ID, ID.unique(), image);
        const arrayBuffer = await storage.getFilePreview(IMAGES_BUCKET_ID, file.$id);
        uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
      } else {
        uploadedImageUrl = image;
      }
      const workspace = await databases.updateDocument(DATABASE_ID, WORKSPACES_ID, workspaceId, {
        name,
        imageUrl: uploadedImageUrl,
      });
      return c.json({ data: workspace });
    }
  );

app.get(
    "/current",
    sessionMiddleware,
    (c) => {
        const user = c.get("user");

        return c.json({data: user});
    }
)

.post(
    "/:workspaceId/reset-invite-code",
    sessionMiddleware,
    async(c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        const {workspaceId} = c.req.param();

        const member =await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member || member.role !== MemberRole.ADMIN){
            return c.json({error: "Unauthorized"}, 401);
        }

        const workspace =await databases.updateDocument(
            DATABASE_ID, WORKSPACES_ID, workspaceId,
            {inviteCode: generateInviteCode(6)},
            );
            return c.json({data: workspace});
    }

)
.post(
    "/:workspaceId/join",
     sessionMiddleware,
     zValidator("json",z.object({code :z.string()})),
     async (c) => {
        const workspaceId = c.req.param("workspaceId");
        const {code} = c.req.valid("json");
        const databases = c.get("databases");
        const user = c.get("user");

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (member){
            return c.json({error: "Already a member"}, 400);
        }

        const workspace = await databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId,
        );
        if (workspace.inviteCode !== code){
            return c.json({error: "Invalid invite code"}, 400);
        }
        await databases.createDocument(
            DATABASE_ID,
            MEMBERS_ID,
            ID.unique(),
            {
                userId: user.$id,
                workspaceId,
                role: MemberRole.MEMBER,
                name: user.name,
            },
        );

    return c.json({data: workspace});
    }
)
.delete(
    "/:workspaceId",
    sessionMiddleware,
    async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");
        const {workspaceId} = c.req.param();

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });
        if (!member || member.role !== MemberRole.ADMIN){
            return c.json({error: "Unauthorized"}, 401);
        }
        await databases.deleteDocument(DATABASE_ID, WORKSPACES_ID, workspaceId);
        return c.json({$id: workspaceId});
    }
);

// Add workspace analytics endpoint
app.get(
  "/:workspaceId/analytics",
  sessionMiddleware,
  async (c) => {
    try {
      const { workspaceId } = c.req.param();
      console.log("Workspace analytics request for workspaceId:", workspaceId);
      
      if (!workspaceId) {
        console.error("Workspace ID is missing");
        throw new Error("Workspace ID is required");
      }

      const databases = c.get("databases");
      const user = c.get("user");
      
      // Verify member access
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Get all projects in the workspace
      const projects = await databases.listDocuments(DATABASE_ID, PROJECTS_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.limit(100000)
      ]);
      
      console.log(`Found ${projects.total} projects in workspace ${workspaceId}`);
      
      const projectIds = projects.documents.map(p => p.$id);
      console.log("Project IDs:", projectIds);
      
      // Fetch tasks for this month using projects
      const thisMonthTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]);
      
      console.log("Total tasks query:", {
        workspaceId,
        dateRange: {
          start: thisMonthStart.toISOString(),
          end: thisMonthEnd.toISOString()
        }
      });
      
      if (thisMonthTasks.documents.length > 0) {
        console.log("Sample task from total tasks:", JSON.stringify(thisMonthTasks.documents[0], null, 2));
      }
      
      console.log(`Found ${thisMonthTasks.total} total tasks in workspace`);
      
      // Get tasks assigned to the member
      const assignedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
        ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
        Query.or([
          Query.equal("assigneeId", member.$id),
          Query.equal("assignedToId", member.$id)
        ]),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]);
      
      console.log(`Found ${assignedTasks.total} tasks assigned to member this month`);
      
      // Fetch completed tasks
      console.log("Querying completed tasks with status:", TaskStatus.DONE);
      
      const completedTasksQuery = [
        ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
        Query.or([
          Query.equal("assigneeId", member.$id),
          Query.equal("assignedToId", member.$id)
        ]),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ];
      
      console.log("Completed tasks query:", JSON.stringify(completedTasksQuery, null, 2));
      
      const completedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, completedTasksQuery);
      
      console.log("Completed tasks query details:", {
        memberId: member.$id,
        projectIds,
        status: TaskStatus.DONE,
        dateRange: {
          start: thisMonthStart.toISOString(),
          end: thisMonthEnd.toISOString()
        }
      });
      
      if (completedTasks.documents.length > 0) {
        console.log("Sample completed task:", JSON.stringify(completedTasks.documents[0], null, 2));
      } else {
        // If no completed tasks found, let's check what tasks exist for this user
        const allUserTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
          ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
          Query.or([
            Query.equal("assigneeId", member.$id),
            Query.equal("assignedToId", member.$id)
          ])
        ]);
        console.log("All user tasks:", {
          total: allUserTasks.total,
          sampleTask: allUserTasks.documents[0] ? JSON.stringify(allUserTasks.documents[0], null, 2) : null
        });
      }
      
      console.log(`Found ${completedTasks.total} completed tasks this month`);
      
      // Fetch overdue tasks
      const overdueTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
        ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
        Query.or([
          Query.equal("assigneeId", member.$id),
          Query.equal("assignedToId", member.$id)
        ]),
        Query.notEqual("status", TaskStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]);
      
      console.log(`Found ${overdueTasks.total} overdue tasks this month`);
      
      // Get incomplete tasks
      const incompleteTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
        ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
        Query.or([
          Query.equal("assigneeId", member.$id),
          Query.equal("assignedToId", member.$id)
        ]),
        Query.notEqual("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]);
      
      console.log(`Found ${incompleteTasks.total} incomplete tasks this month`);

      // Create response with counts
      const response = {
        totalProjects: projects.total,
        totalTasks: thisMonthTasks.total,
        assignedTasks: assignedTasks.total,
        completedTasks: completedTasks.total,
        overdueTasks: overdueTasks.total,
        incompleteTaskCount: incompleteTasks.total,
      };

      console.log("Final analytics response:", response);

      return c.json({
        data: response,
      });
    } catch (error) {
      console.error("Workspace analytics error:", error);
      throw error;
    }
  }
);

export default app;