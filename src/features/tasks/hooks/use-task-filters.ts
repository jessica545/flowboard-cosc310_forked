import { useState, useEffect } from "react";
import { TaskStatus } from "../types";

export const useTaskFilters = () => {
    const [filters, setFilters] = useState({
        projectId: "",
        status: null as TaskStatus | null,
        assigneeId: "",
        search: "",
        dueDate: "",
    });

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        console.log("Updating filters:", newFilters);
        
        // Handle the special case for projectId
        const effectiveProjectId = newFilters.projectId === "all" 
            ? "" 
            : (newFilters.projectId !== undefined ? newFilters.projectId : filters.projectId);
        
        setFilters(prev => {
            const updated = {
                ...prev,
                ...newFilters,
                // Handle special cases for "all" values with more explicit logic
                projectId: effectiveProjectId,
                assigneeId: newFilters.assigneeId === "all" ? "" : (newFilters.assigneeId ?? prev.assigneeId),
                status: newFilters.status === null ? null : (newFilters.status ?? prev.status),
                dueDate: newFilters.dueDate ?? prev.dueDate,
                search: newFilters.search ?? prev.search
            };
            
            console.log("Filters updated:", {
                previous: prev,
                new: updated
            });
            
            return updated;
        });
    };

    // Log filter changes for debugging
    useEffect(() => {
        console.log("Filters changed:", filters);
    }, [filters]);

    return [filters, updateFilters] as const;
};
