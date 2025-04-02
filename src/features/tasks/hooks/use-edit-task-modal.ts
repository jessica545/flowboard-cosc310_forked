import { useState } from "react";

export const useEditTaskModal = () => {
  const [taskId, setTaskId] = useState<string | null>(null);

  const open = (id: string) => setTaskId(id);
  const close = () => setTaskId(null);

  return {
    taskId,
    open,
    close,
    setTaskId,
  };
};
