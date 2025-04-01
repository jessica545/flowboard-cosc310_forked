import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

import {
  InferResponseType,
  InferRequestType,
} from "hono";
// @ts-ignore
type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$patch"], 200>;
// @ts-ignore
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$patch"]>;

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, { json: RequestType["json"], param: RequestType["param"] }>({
    mutationFn: async ({ json, param }) => {
      // @ts-ignore
      const response = await client.api.tasks[":taskId"]["$patch"]({ json, param });
      
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("Task updated");
      
      // Handle task assignment notifications
      if (data.assigneeId || data.assignedToId) {
        // Dispatch event for notification listener
        const event = new CustomEvent('taskAssigned', { 
          detail: { 
            taskId: data.$id,
            taskName: data.name,
            assigneeId: data.assigneeId,
            assignedToId: data.assignedToId
          } 
        });
        window.dispatchEvent(event);
      }
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", data.$id] });
      queryClient.invalidateQueries({ queryKey: ["project-analytics", data.projectId] });
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });
};
