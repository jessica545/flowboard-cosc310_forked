"use client";

import { useGetProject } from "@/features/projects/api/use-get-project";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";

interface ProjectSettingsClientProps {
    projectId: string;
    workspaceId: string;
}

export const ProjectSettingsClient = ({ projectId, workspaceId }: ProjectSettingsClientProps) => {
    const { data: initialValues, isLoading } = useGetProject({ projectId });

    if (isLoading) return <PageLoader/>;
    
    if (!initialValues) return <PageError message="Project not found" />;

    return (
        <div className="w-full lg:max-w-xl">
            <EditProjectForm initialValues={initialValues} />
        </div>
    );
}; 