// @ts-nocheck // Uncomment if you want to disable all TS checks in this file
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetMembersProps {
  workspaceId: string;
}

export const useGetMembers = ({ workspaceId }: UseGetMembersProps) => {
  return useQuery({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      const response = await client.api.members.$get({ query: { workspaceId } });
      if (!response.ok) throw new Error("Failed to fetch members");
      const { data } = await response.json();
      return data;
    },
  });
};