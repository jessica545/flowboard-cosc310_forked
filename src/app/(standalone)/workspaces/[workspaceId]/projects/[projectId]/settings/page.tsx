import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { ProjectSettingsClient } from "./client";

interface ProjectIdSettingsProps {
    params: {
        projectId: string;
        workspaceId: string;
    };
};

const ProjectIdSettingsPage = async ({ params }: ProjectIdSettingsProps) => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    return <ProjectSettingsClient projectId={params.projectId} workspaceId={params.workspaceId} />;
}

export default ProjectIdSettingsPage;