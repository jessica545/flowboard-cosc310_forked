import { Project } from "@/features/projects/types";
import { Task } from "../types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import Link from "next/link";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { ChevronRightIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteTask } from "@/features/tasks/api/use-delete-task";
import { useRouter } from "next/navigation";

interface TaskBreadcrumbsProps {
    project: Project;
    task: Task;
};

export const TaskBreadcrumbs = ({
    project,
    task,
}: TaskBreadcrumbsProps) => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();

    const { mutate, isPending } = useDeleteTask();

    const handleDelete = async () => {
        const confirmDelete = confirm("Are you sure you want to delete this task?")
        if (!confirmDelete) return;

        mutate({ param: { taskId: task.$id} }, {
            onSuccess: () => {
                router.push(`/workspaces/${workspaceId}/tasks`);
            },
        });
    };

    return (
        <div className="flex items-center gap-x-2">
            <ProjectAvatar 
                name={project.name}
                image={project.imageUrl}
                className="size-6 lg:size-8"
            />
            <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
            <p className="text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition">
                {project.name}
            </p>
            </Link>
            <ChevronRightIcon className="size-4 lg:size-5 text-muted-foreground"/>
            <p className="text-sm lg:text-lg font-semibold">
                {task.name}
            </p>
            <Button
                onClick={handleDelete}
                disabled={isPending}
                className="ml-auto"
                variant="destructive"
                size="sm"
            >
                <TrashIcon className="size-4 lg:mr-2"/>
                <span className="hidden lg:block">Delete Task</span>
            </Button>
        </div>
    )
}