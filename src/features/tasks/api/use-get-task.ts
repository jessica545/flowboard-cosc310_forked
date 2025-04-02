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
        // @ts-ignore
        const response = await client.api.tasks[":taskId"].$get({
          param: { taskId },
        });

        if (!response.ok) {
          console.error("Task API response not OK:", await response.text());
          throw new Error("Failed to fetch task");
        }

        const { data } = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching task:", error);
        throw error;
      }
    },
  });
};
