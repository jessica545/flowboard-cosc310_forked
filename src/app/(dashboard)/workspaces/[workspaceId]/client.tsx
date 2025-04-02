"use client"

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { Analytics } from "@/components/analytics";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";


export const WorkspaceIdClient = async () => {
  const workspaceId = useWorkspaceId();
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useGetWorkspaces();
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics(workspaceId);
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
  
  const isLoading = isLoadingWorkspaces || isLoadingAnalytics || isLoadingTasks || isLoadingProjects || isLoadingMembers;
  
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

      {/* Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Tasks ({tasks?.total || 0})</h3>
            <Button size="sm" variant="ghost">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {tasks?.documents && tasks.documents.length > 0 ? (
            <div className="space-y-3">
              {tasks.documents.slice(0, 5).map((task: { $id: string, name: string, project?: { name: string }, dueDate?: string }) => (
                <Link 
                  href={`/workspaces/${workspaceId}/tasks/${task.$id}`} 
                  key={task.$id}
                  className="block hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md"
                >
                  <div className="text-sm font-medium">{task.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{task.project?.name || "No project"}</span>
                    {task.dueDate && (
                      <>
                        <span>•</span>
                        <span>{task.dueDate}</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
              
              <Link 
                href={`/workspaces/${workspaceId}/tasks`} 
                className="block text-center py-2 text-sm text-blue-500 hover:underline mt-2"
              >
                Show All
              </Link>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">No tasks found</div>
          )}
        </div>
      
        {/* Projects Section */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Projects ({projects?.total || 0})</h3>
            <Button size="sm" variant="ghost">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {projects?.documents && projects.documents.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {projects.documents.slice(0, 6).map((project: { $id: string, name: string, ImageUrl?: string }) => (
                <Link 
                  href={`/workspaces/${workspaceId}/projects/${project.$id}`} 
                  key={project.$id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                >
                  <ProjectAvatar 
                    name={project.name} 
                    image={project.ImageUrl} 
                    className="h-8 w-8" 
                  />
                  <span className="text-sm truncate">{project.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">No projects found</div>
          )}
        </div>
      </div>
      
      {/* Members Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Members ({members?.total || 0})</h3>
          <Button size="sm" variant="ghost">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        
        {members?.documents && members.documents.length > 0 ? (
          <div className="space-y-3">
            {members.documents.slice(0, 5).map((member: { $id: string, name: string, email: string }) => (
              <div key={member.$id} className="flex items-center gap-2 p-2">
                <MemberAvatar 
                  name={member.name} 
                  className="h-8 w-8" 
                />
                <div>
                  <div className="text-sm font-medium">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.email}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">No members found</div>
        )}
      </div>

    </div>
  );
}; 