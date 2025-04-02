// @ts-nocheck // TODO: To fix the lint errors

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
}

export const DataFilters = ({ hideProjectFilter }: DataFiltersProps) => {
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
                    <SelectTrigger className="h-8 w-[150px]">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="todo">Todo</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="backlog">Backlog</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={assigneeId || "all"}
                    onValueChange={onAssigneeChange}
                >
                    <SelectTrigger className="h-8 w-[150px]">
                        <SelectValue placeholder="All assignees" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All assignees</SelectItem>
                        {memberOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {!hideProjectFilter && (
                    <Select
                        value={projectId || "all"}
                        onValueChange={onProjectChange}
                    >
                        <SelectTrigger className="h-8 w-[150px]">
                            <SelectValue placeholder="All projects" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All projects</SelectItem>
                            {projectOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
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
                    className="h-8 w-[150px]"
                />
            </div>
        </div>
    );
};
