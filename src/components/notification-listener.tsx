"use client";

import { useEffect } from "react";
import { useTaskNotifications } from "@/features/tasks/hooks/use-task-notifications";
import { useCurrent } from "@/features/auth/api/use-current";

interface TaskAssignedEvent {
  detail: {
    taskId: string;
    taskName: string;
    assigneeId?: string;
    assignedToId?: string;
  }
}

export const NotificationListener = () => {
  const { data: currentUser } = useCurrent();
  const { addNotification } = useTaskNotifications();

  useEffect(() => {
    if (!currentUser) return;

    const handleTaskAssigned = (event: CustomEvent<TaskAssignedEvent['detail']>) => {
      const { taskId, taskName, assignedToId } = event.detail;

      // Only create notification if user is assigned to the task
      if (assignedToId && currentUser.memberId === assignedToId) {
        const message = `You are assigned to the task: ${taskName}`;
        // Only use addNotification from the hook, which handles storage
        addNotification(message, taskId);
      }
    };

    // Add event listener with retry mechanism
    const addEventListenerWithRetry = (retries = 3) => {
      try {
        window.addEventListener('taskAssigned', handleTaskAssigned as EventListener);
      } catch (error) {
        if (retries > 0) {
          setTimeout(() => addEventListenerWithRetry(retries - 1), 1000);
        }
      }
    };

    addEventListenerWithRetry();

    // Cleanup function
    return () => {
      try {
        window.removeEventListener('taskAssigned', handleTaskAssigned as EventListener);
      } catch (error) {
        // Handle error silently
      }
    };
  }, [currentUser, addNotification]);

  return null;
}; 