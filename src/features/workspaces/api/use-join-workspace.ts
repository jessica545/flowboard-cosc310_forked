import {useMutation, useQueryClient} from "@tanstack/react-query";
import {InferRequestType, InferResponseType} from "hono";
import {client} from "@/lib/rpc";
import {toast} from "sonner";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["join"][$post],200>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["join"][$post]>;

export const useJoinWorkspace = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    return useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({param, json}) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const response = await client.api.workspaces[":workspaceId"]["join"]["$post"]({param, json});
            
            if (!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to join workspace");
            }

            return await response.json();
        },
        onSuccess: (data) => {
            toast.success("Joined workspace successfully");
            queryClient.invalidateQueries({queryKey: ["workspaces"]});
            queryClient.invalidateQueries({queryKey: ["workspace", data.data.$id]});
            router.push(`/workspaces/${data.data.$id}`);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to join workspace");
        }
    });
}