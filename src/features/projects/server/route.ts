/* eslint-disable @typescript-eslint/no-unused-vars */
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID, WORKSPACES_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query, type Models, type Databases } from "node-appwrite";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskStatus } from "@/features/tasks/types";
import { z } from "zod";
import { createProjectSchema, updateProjectSchema } from "../schemas";
import { Project } from "../types";
import { env } from "node:process";
import { createSessionClient } from "../../../lib/appwrite";

interface Task extends Models.Document {
  title: string;
  projectId: string;
  assignedToId?: string;
  completed: boolean;
  dueDate?: string;
}

interface Context {
  Variables: {
    userId: string;
    databases: Databases;
  };
}

const app = new Hono<Context>();

// Create a new project
app.post(
    "/",
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
        const databases = c.get("databases");
        const storage = c.get("storage");
        const user = c.get("user");

        const { name, image, workspaceId} = c.req.valid("form");
        
        if (!workspaceId) {
            return c.json({ error: "Missing workspaceId" }, 400);
        }

        let uploadedImageUrl: string | undefined;

        if (image instanceof File) {
            try {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image
                );

                const arrayBuffer = await storage.getFilePreview(
                    IMAGES_BUCKET_ID,
                    file.$id
                );

                uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
            } catch (error) {
                return c.json({ error: "Image upload failed" }, 500);
            }
        }

        const member = await getMember({
            workspaceId,
            userId: user.$id,
            databases,
        });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const project = await databases.createDocument(
            DATABASE_ID,
            PROJECTS_ID,
            ID.unique(),
            {
                name,
                ImageUrl: uploadedImageUrl,
                workspaceId,
            }
        );

        return c.json({ data: project });
    }
);

// Fetch all projects for a workspace
app.get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })), 
    async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");

        const { workspaceId } = c.req.valid("query");

        if (!workspaceId) {
            return c.json({ error: "Missing workspaceId" }, 400);
        }

        const member = await getMember({
            workspaceId,
            userId: user.$id,
            databases,
        });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const projects = await databases.listDocuments(
            DATABASE_ID,
            PROJECTS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.orderDesc("$createdAt"),
            ]
        );

        return c.json({ data: projects });
    }
);

// Fetch a single project by ID
app.get(
    "/:projectId",
    sessionMiddleware,
    async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");
        const { projectId } = c.req.param();

        try {
            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            );

            const member = await getMember({
                workspaceId: project.workspaceId,
                userId: user.$id,
                databases,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            return c.json({ data: project });
        } catch (error) {
            return c.json({ error: "Project not found" }, 404);
        }
    }
);

// Update workspace details
app.patch(
    "/:projectId", 
    sessionMiddleware,
    zValidator("form", updateProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");
      const { projectId } = c.req.param();
      const { name, image } = c.req.valid("form");
      
      const existingProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      )
      
      
      const member = await getMember({
        databases,
        workspaceId : existingProject.workspaceId, 
        userId: user.$id,
      });
      if (!member) {
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
      const project = await databases.updateDocument(
        DATABASE_ID, PROJECTS_ID, projectId, {
        name,
        ImageUrl: uploadedImageUrl,
      });
      return c.json({ data: project });
    }
  );


// UPDATE: DELETE for projects, may or may not work because not completely implemented
app.delete(
    "/:projectId",
    sessionMiddleware,
    async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        const { projectId } = c.req.param();
        const existingProject = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
        )

        const member = await getMember({
            databases,
            workspaceId: existingProject.workspaceId,
            userId: user.$id,
        });

        if (!member){
            return c.json({ error: "Unauthorized" }, 401)
        }

        // TODO: delete tasks 
        await databases.deleteDocument(
            DATABASE_ID,
            PROJECTS_ID,
            projectId,
        );
        
        return c.json({ data: { $id: existingProject.$id }});
    }
)

app
  .use("*", sessionMiddleware)
  .get("/analytics", async (c) => {
    try {
      const projectId = c.req.param("projectId");
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      const databases = c.get("databases");
      const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );

      const userId = c.get("userId");
      if (!userId) {
        throw new Error("User ID is required");
      }

      // Get total tasks
      const totalTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [Query.equal("projectId", projectId), Query.limit(100000)]
      );

      // Get assigned tasks
      const assignedTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),
          Query.equal("assignedToId", userId),
          Query.limit(100000)
        ]
      );

      // Get completed tasks
      const completedTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),
          Query.equal("assignedToId", userId),
          Query.equal("completed", true),
          Query.limit(100000)
        ]
      );

      // Get overdue tasks
      const overdueTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),
          Query.equal("assignedToId", userId),
          Query.lessThan("dueDate", new Date().toISOString()),
          Query.equal("completed", false),
          Query.limit(100000)
        ]
      );
      // Get incomplete tasks
      const incompleteTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),
          Query.equal("assignedToId", userId),
          Query.equal("completed", false),
          Query.limit(100000)
        ]
      );

      const response = {
        totalTasks: totalTasks.documents.length,
        assignedTasks: assignedTasks.documents.length,
        completedTasks: completedTasks.documents.length,
        overdueTasks: overdueTasks.documents.length,
        incompleteTasks: incompleteTasks.documents.length,
      };

      return c.json({
        data: response,
      });
    } catch (error) {
      throw error;
    }
  });

export default app;
