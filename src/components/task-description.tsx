import { Task } from "@/features/tasks/types";
import { useState, useEffect } from "react";
import { Pencil, PencilIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { DottedSeparator } from "./ui/dotted-separator";
import { useUpdateTask } from "@/features/tasks/api/use-update-task";
import { toast } from "sonner";

interface TaskDescriptionProps {
    task: Task;
}

export const TaskDescription = ({
    task,
}: TaskDescriptionProps) => {
    const [ isEditing, setIsEditing ] = useState(false);
    const [ value, setValue ] = useState(task.description || "");
    const { mutate, isPending } = useUpdateTask();
    
    // Update value if task description changes
    useEffect(() => {
        setValue(task.description || "");
    }, [task.description]);

    const handleSave = () => {
        if (!task.$id) {
            console.error("Task ID is missing");
            toast.error("Cannot save description: Task ID is missing");
            return;
        }
        
        console.log("Saving task description:", { taskId: task.$id, description: value });
        mutate(
            {
                json: { description: value },
                param: { taskId: task.$id },
            },
            {
                onSuccess: (data) => {
                    console.log("Description updated successfully:", data);
                    setIsEditing(false);
                },
                onError: (error) => {
                    console.error("Failed to update description:", error);
                    toast.error("Failed to save description. Please try again.");
                }
            }
        );
    }

    return(
        <div className="p-4 border-1 rounded-lg bg-tertiary">
            <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">
                    Description
                </p>
                <Button
                    onClick={() => setIsEditing((prev) => !prev)}
                    size="sm"
                    variant="secondary"
                    className="bg-quaternary hover:bg-[var(--primary-foreground)]"
                >
                    {isEditing ? (
                        <XIcon className="size-4 mr-2" />
                    ) : (
                        <PencilIcon className="size-4 mr-2"/>
                    )}
                    {isEditing ? "Cancel" : "Edit"}
                </Button>
            </div>
            <DottedSeparator className="my-4" />
            {isEditing ? (
                <div className="flex flex-col gap-y-4">
                    <Textarea 
                        placeholder="Add a description..."
                        value={value}
                        rows={4}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={isPending}
                    />
                    <Button
                        size="sm"
                        className="w-fit ml-auto"
                        onClick={handleSave}
                        disabled={isPending}
                    >
                        {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            ) : (
                <div>
                    {task.description || (
                        <span className="text-muted-foreground">
                            No description set
                        </span>
                    )}
                    </div>
            )}
        </div>
    );
};