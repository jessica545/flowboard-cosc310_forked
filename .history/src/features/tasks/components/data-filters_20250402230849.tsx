// @ts-nocheck // TODO: To fix the lint errors

"use client";

import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { ListChecksIcon, UserIcon, FolderIcon } from "lucide-react";
import { TaskStatus } from "../types";
import { DatePicker } from "@/components/date-picker";
import { useTaskFilters } from "../hooks/use-task-filters";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DataFiltersProps {
    hideProjectFilter?: boolean;
    forcedProjectId?: string;
}

export const DataFilters = ({ hideProjectFilter, forcedProjectId }: DataFiltersProps) => {
    const workspaceId = useWorkspaceId();
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

    const isLoading = isLoadingProjects || isLoadingMembers;

    const projectOptions = projects?.documents?.map((project) => ({
        value: project.$id,
        label: project.name,
    })) || [];

    const memberOptions = members?.documents?.map((member) => ({
        value: member.$id,
        label: member.name,
    })) || [];

    const [{ status, assigneeId, projectId, dueDate }, setFilters] = useTaskFilters();

    // Use the forcedProjectId if provided, otherwise use the one from filters
    const effectiveProjectId = forcedProjectId || projectId;

    const onStatusChange = (value: string) => {
        setFilters({ status: value === "all" ? null : (value as TaskStatus) });
    };

    const onAssigneeChange = (value: string) => {
        setFilters({ assigneeId: value === "all" ? null : value });
    };

    const onProjectChange = (value: string) => {
        setFilters({ projectId: value === "all" ? null : value });
    };

    if (isLoading) return null;

    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-2">
                <Select
                    value={status || "all"}
                    onValueChange={onStatusChange}
                >
                    <SelectTrigger className="h-8 w-[150px] bg-tertiary rounded-md shadow-none border-1">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-tertiary">
                        <SelectItem className="py-1 hover:bg-secondary-muted focus:bg-quaternary" value="all">All statuses</SelectItem>
                        <SelectItem className="py-1 hover:bg-secondary-muted focus:bg-quaternary" value={TaskStatus.TODO}>Todo</SelectItem>
                        <SelectItem className="py-1 hover:bg-secondary-muted focus:bg-quaternary" value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                        <SelectItem className="py-1 hover:bg-secondary-muted focus:bg-quaternary" value={TaskStatus.DONE}>Done</SelectItem>
                        <SelectItem className="py-1 hover:bg-secondary-muted focus:bg-quaternary" value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={assigneeId || "all"}
                    onValueChange={onAssigneeChange}
                >
                    <SelectTrigger className="h-8 w-[150px] bg-tertiary rounded-md shadow-none border-1">
                        <SelectValue placeholder="All assignees" />
                    </SelectTrigger>
                    <SelectContent className="bg-tertiary">
                        <SelectItem value="all">All assignees</SelectItem>
                        {memberOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="py-1 hover:bg-secondary-muted focus:bg-quaternary">
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {!hideProjectFilter && (
                    <Select
                        value={effectiveProjectId || "all"}
                        onValueChange={onProjectChange}
                        disabled={!!forcedProjectId}
                    >
                        <SelectTrigger className="h-8 w-[150px] bg-tertiary rounded-md shadow-none border-1">
                            <SelectValue placeholder="All projects" />
                        </SelectTrigger>
                        <SelectContent className="bg-tertiary">
                            <SelectItem value="all">All projects</SelectItem>
                            {projectOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="py-1 hover:bg-secondary-muted focus:bg-quaternary">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <DatePicker
                    value={dueDate ? new Date(dueDate) : undefined}
                    onChange={(date) => setFilters({ dueDate: date?.toISOString() })}
                    placeholder="Due date"
                    className="h-8 w-[150px] bg-tertiary rounded-md border-1 shadow-none"
                />
            </div>
        </div>
    );
};
