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


export const WorkspaceSwitcher = () => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const {data: workspaces} = useGetWorkspace(); // done
    const { open } = useCreateWorkspaceModal();

    const onSelect = (id: string) => {
        router.push(`/workspaces/${id}`);
    };
    return (
        <div className="flex flex-col gap-y-2">
            <NuqsAdapter>
                <div className="flex items-center justify-between">
                    <p className="text-xs uppercase text-neutral-400">Workspaces</p>
                    <RiAddCircleFill onClick={open} className={"size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"}/>
                </div>
                <Select onValueChange={onSelect} value={workspaceId}>
                    <SelectTrigger className={"w-full bg-tertiary font-medium p-1"}>
                        <SelectValue placeholder="No workspace selected"/>
                    </SelectTrigger>
                    <SelectContent className="bg-secondary">
                        {workspaces?.documents.map((workspace: { $id: string, name: string, imageUrl: string }) => (
                            <SelectItem key={workspace.$id} value={workspace.$id} className="bg-tertiary hover:bg-quaternary rounded-md">
                                <div className="flex items-center gap-2 ">
                                    <WorkspaceAvatar name={workspace.name} image={workspace.imageUrl} />
                                    <span className="truncate">{workspace.name}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </NuqsAdapter>
        </div>
    )
}