/* eslint-disable @typescript-eslint/ban-ts-comment */
import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

// TODO: Find a fix for client error
// @ts-ignore
type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$delete"], 200>;
// @ts-ignore
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$delete"]>;

export const useDeleteTask = () => {
  const router = useRouter(); // TODO: Find out where this is used
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      console.log("Deleting task with ID:", param.taskId);
      try {
        // First get the task to know its projectId
        // @ts-ignore
        const taskResponse = await client.api.tasks[":taskId"].$get({ param });
        if (!taskResponse.ok) {
          const errorText = await taskResponse.text();
          console.error("Failed to fetch task before deletion:", errorText);
          throw new Error("Failed to fetch task before deletion");
        }
        
        const taskData = await taskResponse.json();
        console.log("Task data before deletion:", taskData);
        const projectId = taskData.data.projectId;

        // Then delete the task
        // @ts-expect-error client type is actually known
        const response = await client.api.tasks[":taskId"]["$delete"]({ param });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to delete task:", errorText);
          throw new Error(`Failed to delete task: ${errorText}`);
        }

        // Return both the response data and projectId
        const responseData = await response.json();
        console.log("Delete task response:", responseData);
        return { ...responseData, projectId };
      } catch (error) {
        console.error("Error in delete task:", error);
        throw error;
      }
    },
    onSuccess: ({ data, projectId }) => {
      toast.success("Task deleted");

      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", data.$id] });
      queryClient.invalidateQueries({ queryKey: ["project-analytics", projectId] });
      
      // Redirect to tasks list if we're on a task detail page
      const path = window.location.pathname;
      if (path.includes(`/tasks/${data.$id}`)) {
        const workspaceMatch = path.match(/\/workspaces\/([^/]+)/);
        if (workspaceMatch && workspaceMatch[1]) {
          router.push(`/workspaces/${workspaceMatch[1]}/tasks`);
        }
      }
    },
    onError: (error) => {
      console.error("Failed to delete task:", error);
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });

  return mutation;
};
