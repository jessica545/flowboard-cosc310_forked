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
      const userId = user.$id;

      // Verify member access
      const member = await getMember({
        databases,
        workspaceId,
        userId
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Get all projects in the workspace
      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.limit(100000)
        ]
      );

      // Get total tasks in the workspace
      const totalTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.limit(100000)
        ]
      );

      // Get tasks assigned to the user
      const assignedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("assignedToId", userId),
          Query.limit(100000)
        ]
      );

      // Get completed tasks assigned to the user
      const completedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("assignedToId", userId),
          Query.equal("status", TaskStatus.DONE),
          Query.limit(100000)
        ]
      );

      // Get overdue tasks assigned to the user
      const overdueTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("assignedToId", userId),
          Query.lessThan("dueDate", new Date().toISOString()),
          Query.notEqual("status", TaskStatus.DONE),
          Query.limit(100000)
        ]
      );

      // Get incomplete tasks assigned to the user
      const incompleteTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("assignedToId", userId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.limit(100000)
        ]
      );

      // Create response with counts
      const response = {
        totalProjects: projects.documents.length,
        totalTasks: totalTasks.documents.length,
        assignedTasks: assignedTasks.documents.length,
        completedTasks: completedTasks.documents.length,
        overdueTasks: overdueTasks.documents.length,
        incompleteTaskCount: incompleteTasks.documents.length,
      };

      console.log("Workspace analytics response:", response);

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
