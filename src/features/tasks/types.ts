import { Models } from "node-appwrite"
export enum TaskStatus {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE",
}

export type Task = Models.Document & {
    name: string;
    status: TaskStatus;
    workspaceId: string;
    assigneeId: string;
    assignedToId?: string;  // Made optional since not all tasks will have someone assigned
    projectId: string;
    position: number;
    dueDate: string;
    description?: string;
    // Populated fields
    project?: {
        name: string;
        ImageUrl?: string;
    };
    assignee?: {
        name: string;
        imageUrl?: string;
        email: string;
    };
    assignedTo?: {
        name: string;
        imageUrl?: string;
        email: string;
    };
}
    
