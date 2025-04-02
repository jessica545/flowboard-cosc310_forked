"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ResponsiveModal } from "@/components/responsive-modal";
import { WorkspaceOptions } from "./workspace-options";
import { useCreateWorkspaceModal } from "../hooks/use-create-workspace-modal";

export const CreateWorkspaceModal = () => {
    const { isOpen, toggle, close } = useCreateWorkspaceModal();
    
    return (
        <NuqsAdapter>
            <ResponsiveModal open={isOpen} onOpenChange={toggle}>
                <WorkspaceOptions onCancel={close} />
            </ResponsiveModal>
        </NuqsAdapter>
    );
};