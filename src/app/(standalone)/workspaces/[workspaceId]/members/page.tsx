import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { MembersList } from "@/features/members/components/members-list";
import React from "react";
const WorkspaceIdMembersPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="w-full lg:max-w-xl">
      <MembersList />
    </div>
  );
};

export default WorkspaceIdMembersPage;