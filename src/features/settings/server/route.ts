import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { settingsSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID } from "@/config";
import { Query, ID } from "node-appwrite";

const app = new Hono();

const SETTINGS_COLLECTION_ID = "settings";

app.get(
    "/",
    sessionMiddleware,
    async(c) => {
        const databases = c.get("databases");
        console.log("Settings path has been read.");
        const user = c.get("user");
        // const settingsId = await JSON.stringify(process.env.SETTINGS_ID);
        try{ 
            const settings = await databases.listDocuments(
                DATABASE_ID,
                SETTINGS_COLLECTION_ID,
                [Query.equal("userId", user.$id)],
            );

            if (settings.documents.length === 0) {
                // Create default settings if none exist
                return c.json({ 
                    data: {
                        theme: "light",
                        autoSave: true,
                        customColors: {
                            background: "#FFFFFF",
                            text: "#000000"
                        }
                    } 
                });
            }

            return c.json({ data: settings.documents[0] });
        } catch (error) {
            console.error("Error fetching settings:", error);
            return c.json({ error: "Failed to fetch settings"}, 500);
        }

    }
);

app.post("/", 
    sessionMiddleware, 
    zValidator("json", settingsSchema),
    async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");
        const settingsData = c.req.valid("json");
        
        try {
            // Check if settings exist
            const existingSettings = await databases.listDocuments(
                DATABASE_ID,
                SETTINGS_COLLECTION_ID,
                [Query.equal("userId", user.$id)]
            );
            
            if (existingSettings.documents.length > 0) {
                // Update existing settings
                const updated = await databases.updateDocument(
                    DATABASE_ID,
                    SETTINGS_COLLECTION_ID,
                    existingSettings.documents[0].$id,
                    settingsData
                );
                return c.json({ data: updated });
            } else {
                // Create new settings
                const created = await databases.createDocument(
                    DATABASE_ID,
                    SETTINGS_COLLECTION_ID,
                    ID.unique(),
                    {
                        ...settingsData
                    }
                );
                return c.json({ data: created });
            }
        } catch (error) {
            console.error("Error updating settings:", error);
            return c.json({ 
                error: "Failed to update settings",
                details: error instanceof Error ? error.message : "Unknown error"
            }, 500);
        }
    }
);

export default app;