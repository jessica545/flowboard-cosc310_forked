"use client";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SettingsIcon, UsersIcon, MessageSquare } from "lucide-react";
import Link from "next/link";
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from "react-icons/go";
import React from "react";

const routes = [
    {
        label: "Home",
        href: "/",
        icon: GoHome,
        activeIcon: GoHomeFill,
    },    
    {
        label: "My Tasks",
        href: "/tasks",
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill,
    },
    {
        label: "Chat",
        href: "/chat",
        icon: MessageSquare,
        activeIcon: MessageSquare,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: SettingsIcon,
        activeIcon: SettingsIcon,
    },
    {
        label: "Members",
        href: "/members",
        icon: UsersIcon,
        activeIcon: UsersIcon,
    },
];

export const Navigation = () => {
    const workspaceId = useWorkspaceId();
    const pathname = usePathname();

    //  Prevent rendering until `workspaceId` is available
    if (!workspaceId) {
        return <p>Loading workspace...</p>;
    }

    return (
        <ul className="flex flex-col">
            {routes.map((item) => {
                const fullHref = `/workspaces/${workspaceId}${item.href}`;
                const isActive = item.href === "/" 
                    ? (pathname === fullHref || pathname === `/workspaces/${workspaceId}`)
                    : pathname.startsWith(fullHref);

                const Icon = isActive ? item.activeIcon : item.icon;

                return (
                    <li key={item.href}>
                        <Link href={fullHref} aria-current={isActive ? "page" : undefined}>
                            <div className={cn(
                                "flex items-center gap-2.5 p-2.5 rounded-md font-medium text-primary hover:text-hover transition-colors",
                                "hover:bg-secondary/50 transition-colors duration-200",
                                isActive ? "bg-quaternary hover:bg-tertiary text-primary shadow-sm" : "text-neutral-400 hover:text-primary hover:bg-tertiary transition"
                            )}>
                                <Icon className="size-5 text-neutral-500 " />
                                {item.label}
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
};