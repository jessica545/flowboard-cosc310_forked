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
      // First get the task to know its projectId
      // @ts-ignore
      const taskResponse = await client.api.tasks[":taskId"].$get({ param });
      if (!taskResponse.ok) {
        throw new Error("Failed to fetch task before deletion");
      }
      const taskData = await taskResponse.json();
      const projectId = taskData.data.projectId;

      // Then delete the task
      // @ts-expect-error client type is actually known
      const response = await client.api.tasks[":taskId"]["$delete"]({ param });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      // Return both the response data and projectId
      const responseData = await response.json();
      return { ...responseData, projectId };
    },
    onSuccess: ({ data, projectId }) => {
      toast.success("Task deleted");

      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", data.$id] });
      queryClient.invalidateQueries({ queryKey: ["project-analytics", projectId] });
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

  return mutation;
};
