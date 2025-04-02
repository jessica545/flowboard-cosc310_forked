"use client"

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { Analytics } from "@/components/analytics";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";

export const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useGetWorkspaces();
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics(workspaceId);
  
  const isLoading = isLoadingWorkspaces || isLoadingAnalytics;
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  const workspace = workspaces?.documents?.find((w: {$id: string}) => w.$id === workspaceId);
  
  if (!workspace) {
    return <PageError message="Workspace not found" />;
  }

  return (
    <div className="flex flex-col gap-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{workspace.name} Dashboard</h1>
      </div>
      
      {/* Workspace Analytics */}
      {analytics && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Workspace Analytics</h2>
          <Analytics data={{
            taskCount: analytics.data.totalTasks,
            assignedTaskCount: analytics.data.assignedTasks,
            completedTaskCount: analytics.data.completedTasks,
            overdueTaskCount: analytics.data.overdueTasks,
            incompleteTaskCount: analytics.data.incompleteTaskCount
          }} />
        </div>
      )}
      
      {/* Additional workspace content can go here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-medium mb-2">Projects</h3>
          <p className="text-2xl font-bold">{analytics?.data.totalProjects || 0}</p>
        </div>
      </div>
    </div>
  );
}; 