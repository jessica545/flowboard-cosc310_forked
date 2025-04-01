import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

interface UseGetProjectAnalyticsProps {
  projectId: string;
}

// TODO: need to check where is client used
export type ProjectAnalyticsResponseType = InferResponseType<
// @ts-expect-error client type is actually known
  typeof client.api.projects[":projectId"]["analytics"]["$get"],
  200
>;

export const useGetProjectAnalytics = (projectId: string) => {
  return useQuery({
    queryKey: ["project-analytics", projectId],
    queryFn: async () => {
      // @ts-ignore
      const response = await client.api.projects[":projectId"]["analytics"].$get({
        param: { projectId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch project analytics");
      }

      return await response.json();
    },
    // Ensure data is always considered stale
    staleTime: 0,
    // Refetch on window focus and mount
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    // Refetch every 30 seconds to ensure we get updates
    refetchInterval: 30000,
  });
};