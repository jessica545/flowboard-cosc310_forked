/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetTaskProps {
  taskId: string;
}

export const useGetTask = ({ taskId }: UseGetTaskProps) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      try {
        console.log("Fetching task with ID:", taskId);
        
        if (!taskId) {
          console.error("Task ID is undefined or empty");
          throw new Error("Task ID is required");
        }
        
        // @ts-ignore
        const response = await client.api.tasks[":taskId"].$get({
          param: { taskId },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Task API response not OK:", errorText);
          throw new Error(`Failed to fetch task: ${errorText}`);
        }

        const result = await response.json();
        console.log("Task fetched successfully:", result);
        return result.data;
      } catch (error) {
        console.error("Error fetching task:", error);
        throw error;
      }
    },
    enabled: !!taskId,
    staleTime: 1000 * 60, // 1 minute
  });
};
