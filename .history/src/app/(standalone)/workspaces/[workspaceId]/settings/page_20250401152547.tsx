import { getCurrent } from "@/features/auth/queries";
import { getWorkspace } from "@/features/workspaces/queries";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { redirect } from "next/navigation";

import PageLoader from "@/components/page-loader";
import { PageError } from "@/components/page-error";

interface WorkspaceIdSettingsPageProps {
    params: { workspaceId: string;
    };
};

const WorkspaceIdSettingsPage = async ({ params }: WorkspaceIdSettingsPageProps) => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    const { data: initialValues, isLoading } = await getWorkspace({ workspaceId: params.workspaceId });

    if(isLoading) return <PageLoader isLoaded/>
        
    if (!initialValues) return <PageError message="Project not found"/>

    return (
        <div className="w-full lg:max-w-xl"> 
            <EditWorkspaceForm initialValues={initialValues} /> 
        </div>
    );  
};

export default WorkspaceIdSettingsPage;