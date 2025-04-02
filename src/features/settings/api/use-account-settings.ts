import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";
// @ts-expect-error
export type ResponseType = InferResponseType<typeof client.api["account-settings"]["$post"],200>;
// @ts-expect-error
export type RequestType = InferRequestType<typeof client.api["account-settings"]["$post"]>;

export const useAccountSettings = () => {
    const queryClient = useQueryClient();
    return useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({form}) => {
            // @ts-expect-error
            const response = await client.api["account-settings"]["$post"]({form});

            if (!response.ok) {
                throw new Error("Failed to load account settings");
            }
            return await response.json();
        },

        onSuccess: () => {
            toast.success("Settings loaded");
            queryClient.invalidateQueries({ queryKey: ["settings"]});
        },
        onError: () => {
            toast.error("Failed to load account settings");
        },
    })
};