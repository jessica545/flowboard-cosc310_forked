import { getCurrent } from "@/features/auth/queries";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";
import { redirect } from "next/navigation";

import PageLoader from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

interface ProjectIdSettingsProps {
    params: {
        projectId: string;
    };
};

const ProjectIdSettingsPage = async ({params}: ProjectIdSettingsProps) => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    const projectId = useProjectId();

    const { data: initialValues, isLoading } = useGetProject({ projectId });

    if (isLoading) return <PageLoader isLoaded/>
    
    if (!initialValues) return <PageError message="Project not found"/>

    return (
        <div className="w-full lg:max-w-xl">
            <EditProjectForm initialValues={initialValues} />
        </div>
    );
}

export default ProjectIdSettingsPage;