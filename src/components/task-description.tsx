import { Task } from "@/features/tasks/types";
import { useEffect, useState } from "react";
import { Pencil, PencilIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { DottedSeparator } from "./ui/dotted-separator";
import { useUpdateTask } from "@/features/tasks/api/use-update-task";

interface TaskDescriptionProps {
    task: Task;
}

export const TaskDescription = ({
    task,
}: TaskDescriptionProps) => {
    const [ isEditing, setIsEditing ] = useState(false);
    const [ value, setValue ] = useState(task.description);
    const { mutate, isPending, isSuccess, reset } = useUpdateTask();

    // Reset the value when the task changes
    useEffect(() => {
        setValue(task.description);
    }, [task.description]);

    // Close edit mode when save is successful
    useEffect(() => {
        if (isSuccess) {
            setIsEditing(false);
            reset(); // Reset the mutation state
        }
    }, [isSuccess, reset]);

    const handleSave = () => {
        console.log("Saving task description for task ID:", task.$id);
        mutate({
            json: { description: value },
            param: { taskId: task.$id },
        });
    }

    return(
        <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">
                    Description
                </p>
                <Button
                    onClick={() => setIsEditing((prev) => !prev)}
                    size="sm"
                    variant="secondary"
                    disabled={isPending}
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
}