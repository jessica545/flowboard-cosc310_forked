import { Query} from "node-appwrite";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID, TASKS_ID, PROJECTS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { Workspace } from "./types";
import { createSessionClient } from "@/lib/appwrite";
import { TaskStatus } from "@/features/tasks/types";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

interface GetWorkspaceProps {
    workspaceId: string;
}

interface GetWorkspaceInfoProps {
    workspaceId: string;
}

export const getWorkspaceInfo = async ({ workspaceId }: GetWorkspaceInfoProps) => {
    try {
        const {databases, account} = await createSessionClient();
     
        const workspace = await databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        );
        return {
            name: workspace.name,
            description: workspace.description,
            avatar: workspace.avatar,
        }

    } catch (error) {
        console.error("Error fetching workspace:", error);
        return null;
    }
};

export const getWorkspace = async ({ workspaceId }: GetWorkspaceProps) => {

    const {databases, account} = await createSessionClient();
    const user = await account.get();
    const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId,
    });


    if (!member) {
        throw new Error("Unauthorized");
    }

 
    const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId
    );
    return workspace;
};


export const getWorkspaces = async () =>{

    const {databases, account} =await createSessionClient();
    const user = await account.get();
 
    const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("userId", user.$id)]
    )

    if (members.total == 0) {
        return { documents: [], total: 0 };
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);


    const workspaces = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACES_ID,
        [
            Query.orderDesc("$createdAt"),
            Query.contains("$id", workspaceIds)
        ],
    );

    return workspaces;    
   
}

// Get workspace analytics data
export const getWorkspaceAnalytics = async ({ workspaceId }: GetWorkspaceProps) => {
    try {
        const { databases, account } = await createSessionClient();
        
        // Get the current user
        const user = await account.get();
        
        // Validate member access
        const member = await getMember({
            databases,
            workspaceId,
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
        
        // Get all projects in the workspace
        const projects = await databases.listDocuments(DATABASE_ID, PROJECTS_ID, [
            Query.equal("workspaceId", workspaceId),
            Query.limit(100000)
        ]);
        
        console.log(`Found ${projects.total} projects in workspace ${workspaceId}`);
        
        // If no projects, return zeros
        if (projects.total === 0) {
            return {
                totalProjects: 0,
                taskCount: 0,
                taskDifference: 0,
                assignedTaskCount: 0,
                assignedTaskDifference: 0,
                completedTaskCount: 0,
                completedTaskDifference: 0,
                overdueTaskCount: 0,
                overdueTaskDifference: 0,
                incompleteTaskCount: 0,
                incompleteTaskDifference: 0,
            };
        }
        
        const projectIds = projects.documents.map(p => p.$id);
        console.log("Project IDs:", projectIds);
        
        // Fetch tasks for this and last month using projects
        const thisMonthTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        ]);
        
        console.log(`Found ${thisMonthTasks.total} tasks this month across ${projectIds.length} projects`);
        
        const lastMonthTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
        ]);
        
        const taskCount = thisMonthTasks.total;
        const taskDifference = taskCount - lastMonthTasks.total;
        
        // Get tasks assigned to the member - try with member ID instead of user ID
        console.log(`Using member ID (${member.$id}) instead of user ID (${user.$id})`);

        const thisMonthAssignedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
            Query.equal("assignedToId", member.$id),
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        ]);

        console.log(`Found ${thisMonthAssignedTasks.total} tasks assigned to member (member ID) this month`);

        // Try with assigneeId as well
        if (thisMonthAssignedTasks.total === 0) {
            const alternativeQuery = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
                ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
                Query.equal("assigneeId", member.$id),
                Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
            ]);
            
            console.log(`Alternative query with assigneeId (member ID): ${alternativeQuery.total} tasks`);
            
            // Use these results if they have content
            if (alternativeQuery.total > 0) {
                thisMonthAssignedTasks.total = alternativeQuery.total;
            }
        }

        // Last month version with member ID
        const lastMonthAssignedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
            Query.equal("assignedToId", member.$id),
            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
        ]);
        
        const assignedTaskCount = thisMonthAssignedTasks.total;
        const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;
        console.log(`Found ${assignedTaskCount} assigned tasks this month in workspace ${workspaceId}`);
        
        // Fetch completed tasks
        const thisMonthCompletedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
            Query.equal("status", TaskStatus.DONE),
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        ]);
        
        const lastMonthCompletedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
            Query.equal("status", TaskStatus.DONE),
            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
        ]);
        
        const completedTaskCount = thisMonthCompletedTasks.total;
        const completedTaskDifference = completedTaskCount - lastMonthCompletedTasks.total;
        console.log(`Found ${completedTaskCount} completed tasks this month in workspace ${workspaceId}`);
        
        // Fetch overdue tasks
        const thisMonthOverdueTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
            Query.notEqual("status", TaskStatus.DONE),
            Query.lessThan("dueDate", now.toISOString()),
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        ]);
        
        const lastMonthOverdueTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
            Query.notEqual("status", TaskStatus.DONE),
            Query.lessThan("dueDate", now.toISOString()),
            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
        ]);
        
        const overdueTaskCount = thisMonthOverdueTasks.total;
        const overdueTaskDifference = overdueTaskCount - lastMonthOverdueTasks.total;
        console.log(`Found ${overdueTaskCount} overdue tasks this month in workspace ${workspaceId}`);
        
        // Get incomplete tasks
        const thisMonthIncompleteTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
            Query.notEqual("status", TaskStatus.DONE),
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        ]);
        
        const lastMonthIncompleteTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
            Query.notEqual("status", TaskStatus.DONE),
            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
        ]);
        
        const incompleteTaskCount = thisMonthIncompleteTasks.total;
        const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.total;
        console.log(`Found ${incompleteTaskCount} incomplete tasks this month in workspace ${workspaceId}`);
        
        // Check if we have tasks in the database but queries don't match
        const allTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            Query.limit(10)
        ]);
        console.log(`Total tasks in database (sample): ${allTasks.total}`);
        if (allTasks.documents.length > 0) {
            console.log("Sample task:", JSON.stringify(allTasks.documents[0], null, 2));
        }
        
        // Check if there are any tasks for these projects
        if (projectIds.length > 0) {
            const projectTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
                ...(projectIds.length > 0 ? [Query.or(projectIds.map(id => Query.equal("projectId", id)))] : []),
                Query.limit(10)
            ]);
            console.log(`Tasks for projects in workspace ${workspaceId}: ${projectTasks.total}`);
            if (projectTasks.documents.length > 0) {
                console.log("Sample project task:", JSON.stringify(projectTasks.documents[0], null, 2));
            }
        }
        
        return {
            totalProjects: projects.total,
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
        console.error("Error fetching workspace analytics:", error);
        return null;
    }
};