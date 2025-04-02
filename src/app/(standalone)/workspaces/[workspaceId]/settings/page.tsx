import { getCurrent } from "@/features/auth/queries";
import { getWorkspace } from "@/features/workspaces/queries";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { redirect } from "next/navigation";
import {PageLoader} from "@/components/page-loader";
import { PageError } from "@/components/page-error";

interface WorkspaceIdSettingsPageProps {
    params: { workspaceId: string;
    };
};

const WorkspaceIdSettingsPage = async ({ params }: WorkspaceIdSettingsPageProps) => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    try {
        const workspace = await getWorkspace({ workspaceId: params.workspaceId });
        
        if (!workspace) {
            return <PageError message="Workspace not found" />;
        }
        
        return (
            <div className="w-full lg:max-w-xl"> 
                <EditWorkspaceForm initialValues={workspace} /> 
            </div>
        );
    } catch (error) {
        if ((error as Error).message === "Unauthorized") {
            redirect("/");
        }
        return <PageError message="Error loading workspace settings" />;
    }
};

export default WorkspaceIdSettingsPage;