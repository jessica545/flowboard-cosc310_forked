import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
 // @ts-expect-error
type ResponseType = InferResponseType<typeof client.api.members[":memberId"]["$delete"], 200>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
 // @ts-expect-error
type RequestType = InferRequestType<typeof client.api.members[":memberId"]["$delete"]>;

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
           // @ts-expect-error
    const response = await client.api.members[":memberId"]["$delete"]({ param });
      if (!response.ok) throw new Error("Failed to delete member");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Member deleted");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => {
      toast.error("Failed to delete member");
    },
  });
};