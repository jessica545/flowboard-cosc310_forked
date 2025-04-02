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

import React, { useState, useEffect } from "react";

interface TaskViewSwitcherProps {
    hideProjectFilter?: boolean;
    projectId?: string;
}

export const TaskViewSwitcher = ({ hideProjectFilter, projectId }: TaskViewSwitcherProps) => {
    const [view, setView] = useState("table");
    const workspaceId = useWorkspaceId();
    const { open } = useCreateTaskModal();
    const [filters, setFilters] = useTaskFilters();

    // Print debug info
    console.log("TaskViewSwitcher props:", { projectId, hideProjectFilter });
    
    // Simplified approach - just use the project ID directly
    const { data: tasksData, isLoading: isLoadingTasks } = useGetTasks({
        workspaceId,
        projectId: projectId || filters.projectId || undefined,
        status: filters.status,
        assigneeId: filters.assigneeId || null,
        dueDate: filters.dueDate || null,
        search: filters.search || null
    });

    // Log what we received from the API
    console.log(`Received ${tasksData?.documents?.length || 0} tasks from API`);
    if (tasksData?.documents?.length > 0) {
        console.log("First 3 tasks:", tasksData.documents.slice(0, 3).map(t => ({ 
            id: t.$id, 
            name: t.name, 
            projectId: t.projectId 
        })));
    }

    // Double-check tasks match the project ID if provided
    const tasks = React.useMemo(() => {
        if (!tasksData?.documents) return [];
        
        // If we're in a project view, filter to make absolutely sure we only have tasks for this project
        if (projectId) {
            console.log(`Filtering tasks by project ID: ${projectId}`);
            return tasksData.documents.filter(task => task.projectId === projectId);
        }
        
        // If we're filtering by project in the filters, double-check
        if (filters.projectId) {
            console.log(`Filtering tasks by filter project ID: ${filters.projectId}`);
            return tasksData.documents.filter(task => task.projectId === filters.projectId);
        }
        
        return tasksData.documents;
    }, [tasksData, projectId, filters.projectId]);

    console.log(`Final tasks count: ${tasks?.length || 0}`);

    const handleCreateTask = () => {
        if (projectId) {
            open(projectId);
        } else {
            open();
        }
    };

    return (
        <Tabs defaultValue={view} onValueChange={setView} className="flex-1 w-full">
            <div className="flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-muted p-1 rounded-md">
                        <TabsTrigger value="table" className="rounded px-3 py-1.5 text-sm">
                            Table
                        </TabsTrigger>
                        <TabsTrigger value="kanban" className="rounded px-3 py-1.5 text-sm">
                            Kanban
                        </TabsTrigger>
                    </TabsList>
                    <Button 
                        onClick={handleCreateTask} 
                        size="sm" 
                        className="bg-primary text-white hover:bg-primary/90"
                    >
                        + New
                    </Button>
                </div>

                <div className="flex flex-col gap-y-4">
                    <DataFilters 
                        hideProjectFilter={hideProjectFilter} 
                        projectId={projectId}
                        filters={filters}
                        setFilters={setFilters}
                    />
                    {isLoadingTasks ? (
                        <div className="w-full flex items-center justify-center p-8">
                            <Loader className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="w-full flex items-center justify-center p-8 text-muted-foreground">
                            No tasks available for this project
                        </div>
                    ) : (
                        <>
                            <TabsContent value="table" className="mt-0">
                                <DataTable<Task, any>
                                    columns={columns}
                                    data={tasks}
                                />
                            </TabsContent>
                            <TabsContent value="kanban" className="mt-0">
                                <DataKanban data={tasks} />
                            </TabsContent>
                        </>
                    )}
                </div>
            </div>
        </Tabs>
    );
};
