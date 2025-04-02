import { getMember } from "../members/utils";
import { createSessionClient } from "@/lib/appwrite";
import { Project } from "./types";
import { DATABASE_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { TaskStatus } from "../tasks/types";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Query } from "node-appwrite";



interface GetProjectProps {
    projectId: string;
}

// Get a project by ID
export const getProject = async ({
    projectId,
}: GetProjectProps) => {
    try {
        const { databases } = await createSessionClient();
        
        const project = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
        );
        
        return project;
    } catch (error) {
        return null;
    }
};

// Get project analytics data
export const getProjectAnalytics = async ({
    projectId,
}: GetProjectProps) => {
    try {
        const { databases, account } = await createSessionClient();
        
        // Get the current user
        const user = await account.get();
        
        // Fetch project details
        const project = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
        );
        
        // Validate member access
        const member = await getMember({
            databases,
            workspaceId: project.workspaceId,
            userId: user.$id,
        });
        
        if (!member) {
            return null;
        }
        
        const now = new Date();
        const thisMonthStart = startOfMonth(now);
        const thisMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));
        
        // Fetch tasks for this and last month
        const thisMonthTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            Query.equal("projectId", projectId),
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        ]);
        
        const lastMonthTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            Query.equal("projectId", projectId),
            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
        ]);
        
        const taskCount = thisMonthTasks.total;
        const taskDifference = taskCount - lastMonthTasks.total;
        
        // Get tasks assigned to the member (either as assignee or assignedTo)
        const thisMonthAssignedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            Query.equal("projectId", projectId),
                Query.equal("assignedToId", member.$id),
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        ]);
        
        const lastMonthAssignedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            Query.equal("projectId", projectId),
  
                Query.equal("assignedToId", member.$id),

            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
        ]);
        
        const assignedTaskCount = thisMonthAssignedTasks.total;
        const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;
        
        // Fetch completed tasks
        const thisMonthCompletedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            Query.equal("projectId", projectId),
            Query.equal("status", TaskStatus.DONE),
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        ]);
        
        const lastMonthCompletedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            Query.equal("projectId", projectId),
            Query.equal("status", TaskStatus.DONE),
            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
        ]);
        
        const completedTaskCount = thisMonthCompletedTasks.total;
        const completedTaskDifference = completedTaskCount - lastMonthCompletedTasks.total;
        
        // Fetch overdue tasks
        const thisMonthOverdueTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            Query.equal("projectId", projectId),
            Query.notEqual("status", TaskStatus.DONE),
            Query.lessThan("dueDate", now.toISOString()),
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        ]);
        
        const lastMonthOverdueTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            Query.equal("projectId", projectId),
            Query.notEqual("status", TaskStatus.DONE),
            Query.lessThan("dueDate", now.toISOString()),
            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
        ]);
        
        const overdueTaskCount = thisMonthOverdueTasks.total;
        const overdueTaskDifference = overdueTaskCount - lastMonthOverdueTasks.total;
       // Get incomplete tasks for this month
const thisMonthIncompleteTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
    Query.equal("projectId", projectId),
    Query.notEqual("status", TaskStatus.DONE),
    Query.or([
        Query.equal("assigneeId", member.$id),
        Query.equal("assignedToId", member.$id)
    ]),
    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
]);

// Get incomplete tasks for last month
const lastMonthIncompleteTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
    Query.equal("projectId", projectId),
    Query.notEqual("status", TaskStatus.DONE),
    Query.or([
        Query.equal("assigneeId", member.$id),
        Query.equal("assignedToId", member.$id)
    ]),
    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
]);

// Calculate incomplete task counts and differences
const incompleteTaskCount = thisMonthIncompleteTasks.total;
const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.total;

        return {
            taskCount,
            taskDifference,
            assignedTaskCount,
            assignedTaskDifference,
            completedTaskCount,
            completedTaskDifference,
            overdueTaskCount,
            overdueTaskDifference,
            incompleteTaskCount,
            incompleteTaskDifference,
        };
    } catch (error) {
        return null;
    }
};