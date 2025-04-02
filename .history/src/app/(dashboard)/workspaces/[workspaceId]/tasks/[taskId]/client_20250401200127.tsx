"use client";

import { PageError } from "@/components/page-error";
import PageLoader from "@/components/page-loader";
import { useGetTask } from "@/features/tasks/api/use-get-task";
import { useTaskId } from "@/features/tasks/hooks/use-task-id";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, PencilIcon } from "lucide-react";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { format } from "date-fns";
import { TaskActions } from "@/features/tasks/components/task-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEditTaskModal } from "@/features/tasks/hooks/use-edit-task-modal";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { TaskDescription } from "@/components/task-description";

export const TaskIdClient = () => {
    const taskId = useTaskId();
    const { data, isLoading } = useGetTask({ taskId });
    const { open: openEditModal } = useEditTaskModal();

    if (isLoading) return <PageLoader isLoaded />;
    if (!data) return <PageError message="Task not found" />;

    return (
        <div className="flex flex-col gap-6 p-6 bg-secondary rounded-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ProjectAvatar
                        className="size-8"
                        name={data.project?.name}
                        image={data.project?.ImageUrl}
                    />
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{data.project?.name}</span>
                        <span>›</span>
                        <span className="font-medium text-foreground">{data.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditModal(data.$id)}
                    >
                        <PencilIcon className="size-4 mr-2" />
                        Edit
                    </Button>
                    <TaskActions id={data.$id} projectId={data.projectId}>
                        <Button variant="outline" size="sm">
                            <MoreVertical className="size-4" />
                        </Button>
                    </TaskActions>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-tertiary">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-base font-medium">Overview</CardTitle>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-auto p-0"
                            onClick={() => openEditModal(data.$id)}
                        >
                            <PencilIcon className="size-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-sm text-muted-foreground mb-1">Assignee</h3>
                            {data.assignee ? (
                                <div className="flex items-center gap-2">
                                    <MemberAvatar
                                        className="size-6"
                                        name={data.assignee.name}
                                        image={data.assignee.imageUrl}
                                    />
                                    <span className="text-sm">{data.assignee.name}</span>
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground">No assignee</span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm text-muted-foreground mb-1">Assigned To</h3>
                            {data.assignedTo ? (
                                <div className="flex items-center gap-2">
                                    <MemberAvatar
                                        className="size-6"
                                        name={data.assignedTo.name}
                                        image={data.assignedTo.imageUrl}
                                    />
                                    <span className="text-sm">{data.assignedTo.name}</span>
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground">Not assigned</span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm text-muted-foreground mb-1">Due Date</h3>
                            <span className="text-sm">
                                {data.dueDate ? format(new Date(data.dueDate), "MMMM do, yyyy") : "No due date"}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-sm text-muted-foreground mb-1">Status</h3>
                            <Badge variant="secondary" className="capitalize">
                                {data.status.toLowerCase().replace(/_/g, ' ')}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <TaskDescription task={data} />
            </div>
        </div>
    );
}