import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Query } from "node-appwrite";
import { z } from "zod";
import { createAdminClient } from "@/lib/appwrite";
import { getMember } from "../utils";
import { MemberRole } from "../types";

const app = new Hono();

// Get all members for a workspace
app.get(
  "/",
  sessionMiddleware,
  zValidator("query", z.object({ workspaceId: z.string() })),
  async (c) => {
    const { users } = await createAdminClient();
    const databases = c.get("databases");
    const user = c.get("user");
    const { workspaceId } = c.req.valid("query");

    const member = await getMember({ databases, workspaceId, userId: user.$id });
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    const userMembership = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.equal("userId", user.$id),
    ]);
    if (userMembership.documents.length === 0) return c.json({ error: "Unauthorized" }, 401);

    const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal("workspaceId", workspaceId),
    ]);

    const populatedMembers = await Promise.all(
      members.documents.map(async (member) => {
        try {
          const user = await users.get(member.userId);
          return { ...member, name: member.name || user.name, email: user.email };
        } catch {
          return { ...member, name: member.name || "Unknown User", email: "unknown@example.com" };
        }
      })
    );

    return c.json({ data: { ...members, documents: populatedMembers } });
  }
);

// Delete a member
app.delete(
  "/:memberId",
  sessionMiddleware,
  async (c) => {
    const { memberId } = c.req.param();
    const user = c.get("user");
    const databases = c.get("databases");

    const memberToDelete = await databases.getDocument(DATABASE_ID, MEMBERS_ID, memberId);
    const allMembersInWorkspace = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal("workspaceId", memberToDelete.workspaceId),
    ]);
    const member = await getMember({
      databases,
      workspaceId: memberToDelete.workspaceId,
      userId: user.$id,
    });

    if (!member) return c.json({ error: "Unauthorized" }, 401);
    if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    if (allMembersInWorkspace.total === 1) {
      return c.json({ error: "Cannot delete the only member" }, 400);
    }

    await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);
    return c.json({ data: { $id: memberToDelete.$id } });
  }
);

// Update a member's role
app.patch(
  "/:memberId",
  sessionMiddleware,
  zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
  async (c) => {
    const { memberId } = c.req.param();
    const { role } = c.req.valid("json");
    const user = c.get("user");
    const databases = c.get("databases");

    const memberToUpdate = await databases.getDocument(DATABASE_ID, MEMBERS_ID, memberId);
    const allMembersInWorkspace = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal("workspaceId", memberToUpdate.workspaceId),
    ]);
    const member = await getMember({
      databases,
      workspaceId: memberToUpdate.workspaceId,
      userId: user.$id,
    });

    if (!member) return c.json({ error: "Unauthorized" }, 401);
    if (member.role !== MemberRole.ADMIN) return c.json({ error: "Unauthorized" }, 401);
    if (allMembersInWorkspace.total === 1) {
      return c.json({ error: "Cannot downgrade the only member" }, 400);
    }

    await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, { role });
    return c.json({ data: { $id: memberToUpdate.$id } });
  }
);

export default app;