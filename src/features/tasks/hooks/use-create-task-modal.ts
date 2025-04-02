import { useState } from "react";
import { create } from "zustand";

interface CreateTaskModalStore {
    isOpen: boolean;
    projectId?: string;
    setIsOpen: (isOpen: boolean) => void;
    setProjectId: (projectId?: string) => void;
    open: (projectId?: string) => void;
    close: () => void;
}

// Using zustand to make state management more reliable across component re-renders
const useCreateTaskModalStore = create<CreateTaskModalStore>((set) => ({
    isOpen: false,
    projectId: undefined,
    setIsOpen: (isOpen) => set({ isOpen }),
    setProjectId: (projectId) => set({ projectId }),
    open: (projectId) => set({ isOpen: true, projectId }),
    close: () => set({ isOpen: false }),
}));

export const useCreateTaskModal = () => {
    return useCreateTaskModalStore();
};
