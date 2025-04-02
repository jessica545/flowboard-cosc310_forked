"use client";

import { useQueryState, parseAsBoolean } from "nuqs";
import { useTransition } from "react";

export const useCreateWorkspaceModal = () => {
    const [ isPending, startTransition ] = useTransition();
    
    const [isOpen, setIsOpen] = useQueryState (
        "create-workspace",
        parseAsBoolean
        .withDefault(false)
        .withOptions({
            history: "replace",
            clearOnDefault: true,
            startTransition,
        })
    );
    
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    
    return {
        isOpen,
        open,
        close,
        toggle: () => setIsOpen(prev => !prev),
    };
};