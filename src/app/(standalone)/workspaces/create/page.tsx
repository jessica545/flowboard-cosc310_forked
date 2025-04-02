import { getCurrent } from "@/features/auth/queries";
import { WorkspaceOptions } from "@/features/workspaces/components/workspace-options";
import { redirect } from "next/navigation";

const WorkspaceCreatePage = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");
    return (
        <div className="w-full lg:max-w-xl">
            <WorkspaceOptions />
        </div>
    );
};

export default WorkspaceCreatePage;