"use client";

import { Task, TaskStatus } from "@/features/tasks/types";
import React, { useState, useCallback } from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";
import { useUpdateTask } from "../api/use-update-task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { TaskActions } from "./task-actions";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { format } from "date-fns";

interface DataKanbanProps {
    data: Task[];
}

const getColumnTitle = (status: TaskStatus): { title: string; color: string } => {
    switch (status) {
        case TaskStatus.BACKLOG:
            return { title: "Backlog", color: "bg-pink-100 dark:bg-pink-500" };
        case TaskStatus.TODO:
            return { title: "Todo", color: "bg-red-100 dark:bg-red-500" };
        case TaskStatus.IN_PROGRESS:
            return { title: "In Progress", color: "bg-yellow-100 dark:bg-yellow-500" };
        case TaskStatus.IN_REVIEW:
            return { title: "In Review", color: "bg-blue-100 dark:bg-blue-500" };
        case TaskStatus.DONE:
            return { title: "Done", color: "bg-emerald-100 dark:bg-emerald-500" };
    }
};

export const DataKanban = ({ data }: DataKanbanProps) => {
    const { mutate: updateTask } = useUpdateTask();
    const boards: TaskStatus[] = [
        TaskStatus.BACKLOG,
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.IN_REVIEW,
        TaskStatus.DONE,
    ];

    type TasksState = {
        [key in TaskStatus]: Task[];
    };

    const [tasks, setTasks] = useState<TasksState>(() => {
        const initialTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };
        data.forEach((task) => {
            initialTasks[task.status].push(task);
        });
        Object.keys(initialTasks).forEach((status) => {
            initialTasks[status as TaskStatus].sort((a, b) => a.position - b.position);
        });
        return initialTasks;
    });

    const handleDragEnd = useCallback((result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;

        const sourceStatus = source.droppableId as TaskStatus;
        const destinationStatus = destination.droppableId as TaskStatus;

        if (
            sourceStatus === destinationStatus &&
            source.index === destination.index
        ) {
            return;
        }

        const newTasksState = { ...tasks };
        const [movedTask] = newTasksState[sourceStatus].splice(source.index, 1);
        
        const destinationTasks = newTasksState[destinationStatus];
        const newPosition = calculateNewPosition(
            destination.index,
            destinationTasks
        );

        const updatedTask = {
            ...movedTask,
            status: destinationStatus,
            position: newPosition,
        };

        newTasksState[destinationStatus].splice(destination.index, 0, updatedTask);
        setTasks(newTasksState);

        updateTask({
            param: { taskId: draggableId },
            json: {
                status: destinationStatus,
                position: newPosition,
            },
        });
    }, [tasks, updateTask]);

    const calculateNewPosition = (index: number, destinationTasks: Task[]): number => {
        if (destinationTasks.length === 0) return 1000;
        if (index === 0) return destinationTasks[0].position / 2;
        if (index === destinationTasks.length) return destinationTasks[destinationTasks.length - 1].position + 1000;
        
        const prevPosition = destinationTasks[index - 1].position;
        const nextPosition = destinationTasks[index].position;
        return (prevPosition + nextPosition) / 2;
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pl-2 pb-6 pt-1 kanban-scrollbar">
                {boards.map((boardId) => {
                    const { title, color } = getColumnTitle(boardId);
                    const columnTasks = tasks[boardId];
                    return (
                        <div key={boardId} className="bg-secondary rounded-lg w-[283px] flex-shrink-0 bg-secondary">
                            <div className={`p-3 rounded-t-lg ${color}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-sm dark:text-inverse">
                                            {title}
                                        </h3>
                                        <Badge variant="secondary" className="bg-secondary">
                                            {columnTasks.length}
                                        </Badge>
                                    </div>
                                    <Button variant="ghost" size="icon" className="size-6">
                                        <MoreVertical className="size-4 dark:text-inverse" />
                                    </Button>
                                </div>
                            </div>
                            <Droppable droppableId={boardId} type="task">
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="flex flex-col gap-2 p-2 min-h-[200px]"
                                    >
                                        {columnTasks.map((task, index) => (
                                            <Draggable
                                                key={task.$id}
                                                draggableId={task.$id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`bg-tertiary rounded-md p-3 border-1 border-gray-200 shadow-sm hover:shadow-md transition-all ${
                                                            snapshot.isDragging ? 'shadow-lg scale-105' : ''
                                                        }`}
                                                    >
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-start justify-between gap-x-2">
                                                                <p className="font-medium text-sm line-clamp-2">{task.name}</p>
                                                                <TaskActions id={task.$id} projectId={task.projectId}>
                                                                    <Button variant="ghost" className="size-6 p-0">
                                                                        <MoreVertical className="size-4" />
                                                                    </Button>
                                                                </TaskActions>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-2 text-xs text-[var(--text)]">
                                                                <div className="flex items-center gap-2">
                                                                    <ProjectAvatar
                                                                        className="size-4"
                                                                        name={task.project?.name ?? ''}
                                                                        image={task.project?.ImageUrl}
                                                                    />
                                                                    <span className="truncate">{task.project?.name}</span>
                                                                </div>
                                                                {task.dueDate && (
                                                                    <span className="whitespace-nowrap">
                                                                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center justify-between mt-2 border-t pt-2 border-[var(--text-hover)]">
                                                                <div className="flex flex-col gap-2 w-full">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs text-primary">Assignee:</span>
                                                                        <div className="flex items-center gap-2">
                                                                            {task.assignee ? (
                                                                                <>
                                                                                    <MemberAvatar
                                                                                        className="size-5"
                                                                                        fallbackClassName="text-xs"
                                                                                        name={task.assignee.name}
                                                                                        image={task.assignee.imageUrl}
                                                                                    />
                                                                                    <span className="text-xs text-primary font-medium truncate">
                                                                                        {task.assignee.name}
                                                                                    </span>
                                                                                </>
                                                                            ) : (
                                                                                <span className="text-xs text-destruct">
                                                                                    Unassigned
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs text-primary">Assigned to:</span>
                                                                        <div className="flex items-center gap-2">
                                                                            {task.assignedTo ? (
                                                                                <>
                                                                                    <MemberAvatar
                                                                                        className="size-5"
                                                                                        fallbackClassName="text-xs"
                                                                                        name={task.assignedTo.name}
                                                                                        image={task.assignedTo.imageUrl}
                                                                                    />
                                                                                    <span className="text-xs text-primary font-medium truncate">
                                                                                        {task.assignedTo.name}
                                                                                    </span>
                                                                                </>
                                                                            ) : (
                                                                                <span className="text-xs text-destruct">
                                                                                    Unassigned
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}; 