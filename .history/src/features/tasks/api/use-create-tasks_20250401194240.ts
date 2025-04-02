import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

// TODO : Find a fix for client error
// @ts-ignore
type ResponseType = InferResponseType<typeof client.api.tasks["$post"], 200>;
// @ts-ignore
type RequestType = InferRequestType<typeof client.api.tasks["$post"]>;

export const useCreateTask = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            // @ts-ignore
            const response = await client.api.tasks["$post"]({ json });

            if (!response.ok) {
                throw new Error("Failed to create task");
            }
            return await response.json();
        },
        onSuccess: ({ data }) => {
            toast.success("Task created");
            
            // Invalidate all relevant queries
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["project-analytics", data.projectId] });
            
            // Trigger notification event for task assignment if there's an assignee
            if (data.assignedToId) {
                // Dispatch event for notification listener with a small delay to ensure listener is ready
                setTimeout(() => {
                    const event = new CustomEvent('taskAssigned', { 
                        detail: { 
                            taskId: data.$id,
                            taskName: data.name,
                            assignedToId: data.assignedToId
                        } 
                    });
                    window.dispatchEvent(event);
                }, 100);
            }
        },
        onError: (error) => {
            toast.error("Failed to create task");
        },
    });

    return mutation;
};
