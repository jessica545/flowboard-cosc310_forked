"use client";

import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc"; 

interface useGetProjectProps {
    projectId: string;
};
export const useGetProject = ({
    projectId,
}:useGetProjectProps) => {
    return useQuery({
        queryKey: ["project", projectId],
        queryFn: async () => {
            // TODO: to find out
            // @ts-expect-error client type is actually known
            const response = await client.api.projects[":projectId"].$get({
                param: { projectId },
            });

            if (!response.ok) {
                throw new Error("failed to fetch project");
            }

            const { data } = await response.json();

            return data;
        },
    });
};