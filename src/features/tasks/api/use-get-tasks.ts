import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { TaskStatus } from "../types";

interface UseGetTasksProps {
    workspaceId: string;
    projectId?: string | null;
    status?: TaskStatus | null;
    search?: string | null;
    assigneeId?: string | null;
    dueDate?: string | null;
}

export const useGetTasks = ({
    workspaceId,
    projectId,
    status,
    search,
    assigneeId,
    dueDate,
}: UseGetTasksProps) => {
    console.log("useGetTasks called with:", { workspaceId, projectId });

    // Clean up the projectId to make sure we don't send empty strings or "undefined"
    const cleanProjectId = projectId && projectId !== "" ? projectId : undefined;
    
    return useQuery({
        queryKey: [
            "tasks",
            workspaceId,
            cleanProjectId, // Use the cleaned project ID in the query key
            status,
            assigneeId,
            dueDate,
            search
        ],
        queryFn: async () => {
            if (!workspaceId) {
                throw new Error("Workspace ID is required");
            }

            // Log the query parameters
            console.log("Fetching tasks with params:", { 
                workspaceId, 
                projectId: cleanProjectId || "none"
            });

            // @ts-ignore
            const response = await client.api.tasks.$get({
                query: {
                    workspaceId,
                    projectId: cleanProjectId, // Use the cleaned project ID in the API call
                    status: status || undefined,
                    assigneeId: assigneeId || undefined,
                    search: search || undefined,
                    dueDate: dueDate || undefined,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }

            const { data } = await response.json();
            
            console.log(`API returned ${data.documents.length} tasks`);
            if (cleanProjectId) {
                console.log(`Tasks for project ${cleanProjectId}:`, 
                    data.documents
                        .filter(task => task.projectId === cleanProjectId)
                        .map(t => ({ id: t.$id, name: t.name }))
                );
            }
            
            return data;
        },
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        staleTime: 0 // Consider all data stale immediately
    });
};
