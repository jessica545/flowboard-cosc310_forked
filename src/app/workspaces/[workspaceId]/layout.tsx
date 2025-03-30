import { Sidebar } from "@/components/sidebar";
import { getCurrent } from "@/features/auth/queries";
import { getWorkspace } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

interface WorkspaceIdLayoutProps {
  children: React.ReactNode;
  params: {
    workspaceId: string;
  };
}

export default async function WorkspaceIdLayout({
  children,
  params,
}: WorkspaceIdLayoutProps) {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const workspace = await getWorkspace({ workspaceId: params.workspaceId });
  if (!workspace) redirect("/workspaces");

  return (
    <div className="flex h-full w-full min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
} 