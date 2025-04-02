// @ts-nocheck // TODO: To fix the lint errors

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
import { Task } from "../types";

import React from "react";

interface TaskViewSwitcherProps {
    hideProjectFilter?: boolean;
}

export const TaskViewSwitcher = ({ hideProjectFilter }: TaskViewSwitcherProps) => {
    const [view, setView] = useQueryState("task-view", {
        defaultValue: "table",
    });

    const [{ status, assigneeId, projectId, dueDate, search }] = useTaskFilters();
    const workspaceId = useWorkspaceId();
    const { open } = useCreateTaskModal();

    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
        workspaceId,
        projectId,
        assigneeId,
        status,
        dueDate,
        search
    });

    return (
        <Tabs defaultValue={view} onValueChange={setView} className="flex-1 w-full">
            <div className="flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-primary p-1 rounded-md">
                        <TabsTrigger value="table" className="rounded px-3 py-1.5 text-sm bg-secondary">
                            Table
                        </TabsTrigger>
                        <TabsTrigger value="kanban" className="rounded px-3 py-1.5 text-sm bg-secondary">
                            Kanban
                        </TabsTrigger>
                    </TabsList>
                    <Button variant="primary" onClick={open} size="sm">
                        + New Task
                    </Button>
                </div>

                <div className="flex flex-col gap-y-4">
                    <DataFilters hideProjectFilter={hideProjectFilter} />
                    {isLoadingTasks ? (
                        <div className="w-full flex items-center justify-center p-8">
                            <Loader className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            <TabsContent value="table" className="mt-0">
                                <DataTable<Task, any>
                                    columns={columns}
                                    data={tasks?.documents || []}
                                />
                            </TabsContent>
                            <TabsContent value="kanban" className="mt-0">
                                <DataKanban data={tasks?.documents || []} />
                            </TabsContent>
                        </>
                    )}
                </div>
            </div>
        </Tabs>
    );
};
