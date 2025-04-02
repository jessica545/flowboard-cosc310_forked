// @ts-nocheck // TODO: Fix lint errors
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { PlusIcon, Loader } from "lucide-react";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useGetTasks } from "../api/use-get-tasks";
import { useQueryState } from "nuqs";
import { DataFilters } from "./data-filters";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useTaskFilters } from "../hooks/use-task-filters";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { DataKanban } from "./data-kanban";
import React, { useEffect } from "react";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

interface TaskViewSwitcherProps {
    hideProjectFilter?: boolean;
    forceProjectId?: string;
}

export const TaskViewSwitcher = ({ hideProjectFilter, forceProjectId }: TaskViewSwitcherProps) => {
    const [view, setView] = useQueryState("task-view", {
        defaultValue: "table",
    });

    const [{ status, assigneeId, projectId, dueDate, search }, setFilters] = useTaskFilters();
    const workspaceId = useWorkspaceId();
    const { open } = useCreateTaskModal();
    
    // If we're in a project page, force use that project ID
    const currentProjectId = useProjectId();
    const activeProjectId = forceProjectId || (hideProjectFilter ? currentProjectId : projectId);
    
    // When in a project page, set the projectId filter automatically
    useEffect(() => {
        if (forceProjectId && forceProjectId !== projectId) {
            console.log("Setting projectId filter to:", forceProjectId);
            setFilters({ projectId: forceProjectId });
        } else if (hideProjectFilter && currentProjectId && currentProjectId !== projectId) {
            console.log("Setting projectId filter to currentProjectId:", currentProjectId);
            setFilters({ projectId: currentProjectId });
        }
    }, [hideProjectFilter, currentProjectId, projectId, forceProjectId, setFilters]);

    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
        workspaceId,
        projectId: activeProjectId,
        assigneeId,
        status,
        dueDate,
        search
    });

    return (
        <Tabs defaultValue={view} onValueChange={setView} className="flex-1 w-full border-none rounded-lg">
            <div className="h-full flex flex-col overflow-auto bg-secondary p-4">
                <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
                    <TabsList className="w-full lg:w-auto">
                        <TabsTrigger className="h-8 w-full lg:w-auto bg-tertiary" value="table">
                            Table
                        </TabsTrigger>
                        <TabsTrigger className="h-8 w-full lg:w-auto bg-tertiary" value="kanban">
                            Kanban
                        </TabsTrigger>
                    </TabsList>
                    <Button onClick={open} size="sm" className="w-full lg:w-auto">
                        <PlusIcon className="size-4 mr-2" />
                        New Task
                    </Button>
                </div>
                <DottedSeparator className="my-4" />
                <DataFilters hideProjectFilter={hideProjectFilter} />
                <DottedSeparator className="my-4" />

                {isLoadingTasks ? (
                    <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
                        <Loader className="size-5 animate-spin text-muted-foreground" />
                    </div>
                ) : tasks?.documents?.length === 0 ? (
                    <div className="w-full flex items-center justify-center p-8 text-muted-foreground">
                        No tasks found. Create one to get started!
                    </div>
                ) : (
                    <>
                        <TabsContent value="table" className="mt-0">
                            <DataTable columns={columns} data={tasks?.documents || []} />
                        </TabsContent>
                        <TabsContent value="kanban" className="mt-0">
                            <DataKanban data={tasks?.documents || []} />
                        </TabsContent>
                    </>
                )}
            </div>
        </Tabs>
    );
};
