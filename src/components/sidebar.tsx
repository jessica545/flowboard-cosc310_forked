import Image from "next/image";
import React from "react";
import Link from "next/link";
import { Projects } from "@/components/projects";
import { Navigation } from "@/components/navigation";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";

export const Sidebar = () => {
    return (
        <aside className="h-full min-h-screen bg-neutral-100 p-4 w-64 flex-shrink-0 flex flex-col">
            {/* Logo */}
            <Link href="/" aria-label="Go to Home">
                <Image src="/logo.svg" alt="Company Logo" width={164} height={48} priority />
            </Link>

            <DottedSeparator className="my-4" />
            <WorkspaceSwitcher />
            <DottedSeparator className="my-4" />
            <Navigation />
            <DottedSeparator className="my-4" />
            <div className="flex-1 overflow-y-auto">
                <Projects />
            </div>
        </aside>
    );
};
