import { getCurrent } from "@/features/auth/queries";
import { JoinByLinkForm } from "@/features/workspaces/components/join-by-link-form";
import { redirect } from "next/navigation";

export default async function JoinPage() {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");
    
    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
            <div className="w-full max-w-md">
                <JoinByLinkForm onCancel={() => redirect("/")} />
            </div>
        </div>
    );
} 