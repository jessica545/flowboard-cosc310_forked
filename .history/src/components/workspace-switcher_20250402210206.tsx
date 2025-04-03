/* eslint-disable react/react-in-jsx-scope */
"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import {useGetWorkspace} from "@/features/workspaces/api/use-get-workspaces";
import {RiAddCircleFill} from "react-icons/ri";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar";
import { Loader2 } from "lucide-react";

export const WorkspaceSwitcher = () => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const {data: workspaces, isLoading} = useGetWorkspace();
    const { open } = useCreateWorkspaceModal();

    const onSelect = (id: string) => {
        router.push(`/workspaces/${id}`);
    };

    return (
        <div className="flex flex-col gap-y-2 text-primar">
            <NuqsAdapter>
                <div className="flex items-center justify-between">
                    <p className="text-xs uppercase text-neutral-400">Workspaces</p>
                    <RiAddCircleFill onClick={open} className={"size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"}/>
                </div>
                <Select onValueChange={onSelect} value={workspaceId}>
                    <SelectTrigger className={"w-full bg-tertiary font-medium p-1"}>
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading...</span>
                            </div>
                        ) : (
                            <SelectValue placeholder="No workspace selected"/>
                        )}
                    </SelectTrigger>
                    <SelectContent className="bg-secondary shadow-md">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        ) : workspaces?.documents && workspaces.documents.length > 0 ? (
                            workspaces.documents.map((workspace: { $id: string, name: string, imageUrl: string }) => (
                                <SelectItem key={workspace.$id} value={workspace.$id} className="">
                                    <div className="flex items-center gap-2">
                                        <WorkspaceAvatar name={workspace.name} image={workspace.imageUrl} />
                                        <span className="truncate">{workspace.name}</span>
                                    </div>
                                </SelectItem>
                            ))
                        ) : (
                            <div className="p-4 text-sm text-neutral-500 text-center">
                                No workspaces found
                            </div>
                        )}
                    </SelectContent>
                </Select>
            </NuqsAdapter>
        </div>
    )
}