export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  conversationId: string;
}

export interface MessageFormData {
  content: string;
}

export interface Conversation {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
} 