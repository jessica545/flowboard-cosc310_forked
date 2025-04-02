import { ProjectAnalyticsResponseType } from "@/features/projects/api/use-get-project-analytics";
import { AnalyticsCard } from "@/components/analytics-card";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { DottedSeparator } from "./ui/dotted-separator";
import React from "react";

// Define a type that works for both client-side and server-side data
type AnalyticsProps = {
  data: {
    taskCount: number;
    assignedTaskCount: number;
    completedTaskCount: number;
    overdueTaskCount: number;
    incompleteTaskCount: number;
    [key: string]: any; // For any additional properties
  };
};

export const Analytics = ({ data }: AnalyticsProps) => {
  return (
    <ScrollArea className="border-none rounded-lg w-full whitespace-nowrap shrink-0 mb-4">
      <div className="w-full flex flex-row">
        <div className="w-full flex flex-row scrollbar">
          
          {/* Total Tasks */}
          <div className="flex items-center flex-1 py-2 px-1">
            <AnalyticsCard
              title="Total Tasks"
              value={data.taskCount || 0}
            />
            {/* <DottedSeparator direction="vertical" /> */}
          </div>

          {/* Assigned Tasks */}
          <div className="flex items-center flex-1 py-2 px-1">
            <AnalyticsCard
              title="Tasks Assigned To Me"
              value={data.assignedTaskCount || 0}
            />
            {/* <DottedSeparator direction="vertical" /> */}
          </div>

          {/* Completed Tasks */}
          <div className="flex items-center flex-1 py-2 px-1">
            <AnalyticsCard
              title="Completed Tasks"
              value={data.completedTaskCount || 0}
            />
            {/* <DottedSeparator direction="vertical" /> */}
          </div>

          {/* Overdue Tasks */}
          <div className="flex items-center flex-1 py-2 px-1">
            <AnalyticsCard
              title="Overdue Tasks"
              value={data.overdueTaskCount || 0}
            />
            {/* <DottedSeparator direction="vertical" /> */}
          </div>
          
          {/* Incomplete Tasks */}
          <div className="flex items-center flex-1 py-2 px-1">
            <AnalyticsCard
              title="Incomplete Tasks"
              value={data.incompleteTaskCount || 0}
            />
          </div>
        </div>
      </div>
      <ScrollBar orientation="horizontal" className="bg-secondary"/>
    </ScrollArea>
  );
};