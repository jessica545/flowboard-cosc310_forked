"use client";
import { Loader, LogOut, Square } from "lucide-react";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
}from "@/components/ui/dropdown-menu"
import { DottedSeparator } from "@/components/ui/dotted-separator";

import { useLogout } from "../api/use-logout";
import { useCurrent } from "../api/use-current";
import { useAccountSettings } from "../../settings/api/use-account-settings";
import { useAccountSettingsModal } from "../../settings/hooks/use-account-settings-modal";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const UserButton = () => {
    const { data: user, isLoading: isUserLoading } = useCurrent();
    const { mutate: logout } = useLogout();
    const { isPending: isSettingsLoading } = useAccountSettings();
    
    if (isUserLoading || isSettingsLoading) {
        return (
            <div className="size-10 rounded-full flex items center justify center bg-neutral-200 border border-neutral-300">
            <Loader className="size-4 animate-spin text-muted-foreground" />
            </div>
        );
    }
    
    if(!user) {
        return null;
    }
    const {name,email} = user;
    
    const avatarFallback = name
    ?name.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase() ?? "U";
    return(
        <div className="p-2">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="outline-none relative">
                    <Avatar className="size-10 hover:opacity-75 transition border border-neutral-300">
                        <AvatarFallback className="font-medium text-neutral-500 flex items-center justify-center">
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom" className="w-60" sideOffset={10}>
                <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
                    <Avatar className="size-[52px] border border-neutral-300">
                        <AvatarFallback className="bg-neutral-200 text-xl font-medium text-neutral-500 flex items-center justify-center">
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-primary">
                            {name || "User"}
                        </p>
                        <p className="text-xs text-neutral-500">{email}</p>
                    </div>
                </div>
                <DropdownMenuItem
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    className="h-10 flex items-center justify-center text-primary font-medium cursor-pointer hover:bg-tertiary"
                >
                    <div className="flex items-center gap-2">
                        <span>Switch Theme</span>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <ThemeSwitcher />
                        </div>
                    </div>
                </DropdownMenuItem>
                {/* <DropdownMenuItem
                    onClick={open}
                    className="h-10 flex items-center justify-center text-primary font-medium cursor-pointer hover:bg-tertiary"
                >
                    Settings
                </DropdownMenuItem> */}
                <DottedSeparator className="mb-1"/>
                    <DropdownMenuItem 
                        onClick={() =>logout()}
                        className ="h-10 flex items-center justify-center text-amber-700 font-medium cursor-pointer hover:bg-tertiary"
                    >
                        <div className="text-[var(--destructive-foreground)] hover:text-destruct transition-colors flex items-center justify-center">
                            <LogOut className="size-4 mr-2"/>
                            <span>Log out</span> 
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
};