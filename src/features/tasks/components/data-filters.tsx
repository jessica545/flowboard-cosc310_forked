// @ts-nocheck // TODO: To fix the lint errors

import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { ListChecksIcon, UserIcon, FolderIcon } from "lucide-react";
import { TaskStatus } from "../types";
import { DatePicker } from "@/components/date-picker";

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
    projectId?: string;
    filters: {
        projectId: string;
        status: TaskStatus | null;
        assigneeId: string;
        search: string;
        dueDate: string;
    };
    setFilters: (filters: any) => void;
}

export const DataFilters = ({ hideProjectFilter, projectId, filters, setFilters }: DataFiltersProps) => {
    const workspaceId = useWorkspaceId();
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

    const isLoading = isLoadingProjects || isLoadingMembers;

    const projectOptions = projects?.documents.map((project) => ({
        value: project.$id,
        label: project.name,
    }));

    const memberOptions = members?.documents.map((member) => ({
        value: member.$id,
        label: member.name,
    }));

    const onStatusChange = (value: string) => {
        setFilters(prev => ({
            ...prev,
            status: value === "all" ? null : (value as TaskStatus)
        }));
    };

    const onAssigneeChange = (value: string) => {
        setFilters(prev => ({
            ...prev,
            assigneeId: value === "all" ? "" : value
        }));
    };

    const onProjectChange = (value: string) => {
        // Only allow project changes when not in project view
        if (!projectId) {
            setFilters(prev => ({
                ...prev,
                projectId: value === "all" ? "" : value
            }));
        }
    };

    const onDateChange = (date: Date | undefined) => {
        setFilters(prev => ({
            ...prev,
            dueDate: date?.toISOString() || ""
        }));
    };

    if (isLoading) return null;

    // If we're in a project view, use the projectId prop as the current project ID
    // Otherwise, use the project ID from filters
    const currentProjectId = projectId || filters.projectId;

    // If we're in a project view, display the current project as selected
    // but don't allow changing it through the dropdown
    const isProjectViewMode = !!projectId;

    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-2">
                <Select
                    value={filters.status || "all"}
                    onValueChange={onStatusChange}
                >
                    <SelectTrigger className="h-8 w-[150px]">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                        <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                        <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                        <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.assigneeId || "all"}
                    onValueChange={onAssigneeChange}
                >
                    <SelectTrigger className="h-8 w-[150px]">
                        <SelectValue placeholder="All assignees" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All assignees</SelectItem>
                        {memberOptions?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Only show project filter when not in project view and hideProjectFilter is false */}
                {!hideProjectFilter && !isProjectViewMode && (
                    <Select
                        value={currentProjectId || "all"}
                        onValueChange={onProjectChange}
                    >
                        <SelectTrigger className="h-8 w-[150px]">
                            <SelectValue placeholder="All projects" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All projects</SelectItem>
                            {projectOptions?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <DatePicker
                    value={filters.dueDate ? new Date(filters.dueDate) : undefined}
                    onChange={onDateChange}
                    placeholder="Due date"
                    className="h-8 w-[150px]"
                />
            </div>
        </div>
    );
};
