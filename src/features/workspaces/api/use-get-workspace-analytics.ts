import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

// Define the response type
export type WorkspaceAnalyticsResponseType = InferResponseType<
  // @ts-expect-error client type is actually known
  typeof client.api.workspaces[":workspaceId"]["analytics"]["$get"],
  200
>;

export const useGetWorkspaceAnalytics = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: async () => {
      console.log("Fetching analytics for workspace:", workspaceId);
      // @ts-ignore
      const response = await client.api.workspaces[":workspaceId"]["analytics"].$get({
        param: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch workspace analytics");
      }

      const responseData = await response.json();
      console.log("Raw workspace analytics response:", responseData);
      return responseData;
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