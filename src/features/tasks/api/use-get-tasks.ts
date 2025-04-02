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
    return useQuery({
        queryKey: [
            "tasks",
            workspaceId,
            projectId,
            status,
            assigneeId,
            dueDate,
            search
        ],
        queryFn: async () => {
            try {
                console.log("Fetching tasks with params:", {
                    workspaceId,
                    projectId: projectId ?? undefined,
                    status: status ?? undefined,
                    assigneeId: assigneeId ?? undefined,
                    search: search ?? undefined,
                    dueDate: dueDate ?? undefined,
                });
                
                const response = await client.api.tasks.$get({
                    query: {
                        workspaceId,
                        projectId: projectId ?? undefined,
                        status: status ?? undefined,
                        assigneeId: assigneeId ?? undefined,
                        search: search ?? undefined,
                        dueDate: dueDate ?? undefined,
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Failed to fetch tasks:", errorText);
                    throw new Error("Failed to fetch tasks");
                }

                const { data } = await response.json();
                console.log("Tasks fetched successfully:", data);
                return data;
            } catch (error) {
                console.error("Error in useGetTasks:", error);
                throw error;
            }
        },
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        staleTime: 0 // Consider all data stale immediately
    });
};
