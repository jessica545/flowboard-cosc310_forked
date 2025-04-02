import Image from "next/image";
import React from "react";
import Link from "next/link";
import { Projects } from "@/components/projects";
import { Navigation } from "@/components/navigation";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";

export const Sidebar = () => {
    return (
        <aside className="h-full min-h-screen bg-secondary p-4 w-64 flex-shrink-0 flex flex-col">
            {/* Logo */}
            <div className="relative w-[232px] h-[56px]">
                <Link href="/" aria-label="Go to Home">
                    <Image src="/Flowboard Logo Light Banner-01.svg" alt="Company Logo" fill className="block dark:hidden" priority/>
                    <Image src="/Flowboard Logo Dark Banner-01.svg" alt="Company Logo" fill className="hidden dark:block" priority/>
                </Link>
            </div>

            <DottedSeparator className="mb-4" />
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