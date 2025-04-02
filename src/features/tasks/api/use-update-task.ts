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
      console.log("Updating task with:", { json, param });
      try {
        // @ts-ignore
        const response = await client.api.tasks[":taskId"]["$patch"]({ json, param });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to update task:", errorText);
          throw new Error(`Failed to update task: ${errorText}`);
        }
        
        const result = await response.json();
        console.log("Task update successful:", result);
        return result;
      } catch (error) {
        console.error("Error in useUpdateTask:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("Task updated");
      
      // Handle task assignment notifications
      if (data.data.assigneeId || data.data.assignedToId) {
        // Dispatch event for notification listener
        const event = new CustomEvent('taskAssigned', { 
          detail: { 
            taskId: data.data.$id,
            taskName: data.data.name,
            assigneeId: data.data.assigneeId,
            assignedToId: data.data.assignedToId
          } 
        });
        window.dispatchEvent(event);
      }
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", data.data.$id] });
      queryClient.invalidateQueries({ queryKey: ["project-analytics", data.data.projectId] });
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
};
