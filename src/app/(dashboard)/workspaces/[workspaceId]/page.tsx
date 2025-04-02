import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { getWorkspace, getWorkspaceAnalytics } from "@/features/workspaces/queries";
import { Analytics } from "@/components/analytics";

interface WorkspaceIdPageProps {
    params: { workspaceId: string };
}

const WorkspaceIdPage = async ({ params }: WorkspaceIdPageProps) => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");
    
    // Fetch workspace data
    const workspace = await getWorkspace({
        workspaceId: params.workspaceId,
    });

    if (!workspace) {
        throw new Error("Workspace not found");
    }
    
    // Fetch workspace analytics
    const analyticsData = await getWorkspaceAnalytics({
        workspaceId: params.workspaceId,
    });
    
    return (
        <div className="flex flex-col gap-y-4 p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">{workspace.name} Dashboard</h1>
            </div>
            
            {/* Workspace Analytics */}
            {analyticsData && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Workspace Analytics</h2>
                    <Analytics data={{
                        taskCount: analyticsData.taskCount,
                        assignedTaskCount: analyticsData.assignedTaskCount,
                        completedTaskCount: analyticsData.completedTaskCount,
                        overdueTaskCount: analyticsData.overdueTaskCount,
                        incompleteTaskCount: analyticsData.incompleteTaskCount
                    }} />
                </div>
            )}
            
            {/* Additional workspace content */}
            {analyticsData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="font-medium mb-2">Projects</h3>
                        <p className="text-2xl font-bold">{analyticsData.totalProjects || 0}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceIdPage;