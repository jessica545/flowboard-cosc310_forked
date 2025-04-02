"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { InferResponseType } from "hono";
// @ts-expect-error
export type ResponseType = InferResponseType<typeof client.api.settings["$post"],200>;
// @ts-expect-error
export type RequestType = InferRequestType<typeof client.api.settings["$post"]>;

export const useUpdateAccountSettings = () => {
    const queryClient = useQueryClient();
    // const workspaceId = useWorkspaceId();

    return useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ( RequestType ) => {
            try {
                // @ts-ignore
                const response = await client.api.settings["$post"]({ json: {...RequestType} });
                
                return await response.json();

            } catch (error) {
                console.error("Error updating settings:", {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                });
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Settings updated successfully");
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to update settings");
        },
    });
};