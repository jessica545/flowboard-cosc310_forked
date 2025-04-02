import { DATABASE_ID, CONVERSATIONS_ID, MESSAGES_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Query } from "node-appwrite";
import { z } from "zod";
import { getMember } from "@/features/members/utils";

const app = new Hono();

// Get all conversations for a workspace
app.get(
  "/conversations",
  sessionMiddleware,
  zValidator("query", z.object({ workspaceId: z.string() })),
  async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { workspaceId } = c.req.valid("query");

    // Check if user is a member of the workspace
    const member = await getMember({ databases, workspaceId, userId: user.$id });
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    // Find all conversations where the user is a member
    const conversations = await databases.listDocuments(DATABASE_ID, CONVERSATIONS_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.search("memberIds", user.$id),
    ]);

    // Get the last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.documents.map(async (conversation) => {
        // Get the last message for the conversation
        const messages = await databases.listDocuments(DATABASE_ID, MESSAGES_ID, [
          Query.equal("conversationId", conversation.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(1),
        ]);

        return {
          id: conversation.$id,
          name: conversation.name,
          workspaceId: conversation.workspaceId,
          createdAt: conversation.$createdAt,
          updatedAt: conversation.$updatedAt,
          memberIds: conversation.memberIds,
          lastMessage: messages.documents.length > 0
            ? {
                id: messages.documents[0].$id,
                content: messages.documents[0].content,
                senderId: messages.documents[0].senderId,
                createdAt: messages.documents[0].$createdAt,
                username: messages.documents[0].username,
                conversationId: messages.documents[0].conversationId,
              }
            : undefined,
        };
      })
    );

    return c.json({ data: conversationsWithLastMessage });
  }
);

// Create a new conversation
app.post(
  "/conversations",
  sessionMiddleware,
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
      workspaceId: z.string(),
      memberIds: z.array(z.string()),
    })
  ),
  async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { name, workspaceId, memberIds } = c.req.valid("json");

    // Check if user is a member of the workspace
    const member = await getMember({ databases, workspaceId, userId: user.$id });
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    // Add current user to the member list if not already there
    const allMemberIds = memberIds.includes(user.$id)
      ? memberIds
      : [...memberIds, user.$id];

    // Create the conversation
    const conversation = await databases.createDocument(DATABASE_ID, CONVERSATIONS_ID, "unique()", {
      name,
      workspaceId,
      memberIds: allMemberIds,
    });

    return c.json({
      data: {
        id: conversation.$id,
        name: conversation.name,
        workspaceId: conversation.workspaceId,
        createdAt: conversation.$createdAt,
        updatedAt: conversation.$updatedAt,
        memberIds: conversation.memberIds,
      },
    });
  }
);

// Get all messages for a conversation
app.get(
  "/messages",
  sessionMiddleware,
  zValidator("query", z.object({ conversationId: z.string() })),
  async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { conversationId } = c.req.valid("query");

    // Get the conversation
    const conversation = await databases.getDocument(DATABASE_ID, CONVERSATIONS_ID, conversationId);
    
    // Check if user is a member of this conversation
    if (!conversation.memberIds.includes(user.$id)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get all messages for the conversation
    const messages = await databases.listDocuments(DATABASE_ID, MESSAGES_ID, [
      Query.equal("conversationId", conversationId),
      Query.orderAsc("$createdAt"),
    ]);

    const formattedMessages = messages.documents.map((message) => ({
      id: message.$id,
      content: message.content,
      senderId: message.senderId,
      createdAt: message.$createdAt,
      username: message.username,
      avatar: message.avatar,
      conversationId: message.conversationId,
    }));

    return c.json({ data: formattedMessages });
  }
);

// Send a message
app.post(
  "/messages",
  sessionMiddleware,
  zValidator(
    "json",
    z.object({
      conversationId: z.string(),
      content: z.string().min(1),
      username: z.string().optional(),
      avatar: z.string().optional(),
    })
  ),
  async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { conversationId, content, username, avatar } = c.req.valid("json");

    // Get the conversation
    const conversation = await databases.getDocument(DATABASE_ID, CONVERSATIONS_ID, conversationId);
    
    // Check if user is a member of this conversation
    if (!conversation.memberIds.includes(user.$id)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Create the message
    const message = await databases.createDocument(DATABASE_ID, MESSAGES_ID, "unique()", {
      conversationId,
      content,
      senderId: user.$id,
      username: username || user.name,
      avatar: avatar || "",
    });

    // Update the conversation's updatedAt time
    await databases.updateDocument(DATABASE_ID, CONVERSATIONS_ID, conversationId, {
      $updatedAt: new Date().toISOString(),
    });

    return c.json({
      data: {
        id: message.$id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.$createdAt,
        username: message.username,
        avatar: message.avatar,
        conversationId: message.conversationId,
      },
    });
  }
);

export default app; 