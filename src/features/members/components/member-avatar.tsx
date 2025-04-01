import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import React from "react";
// TODO: FB-3025 - This is a boilerplate, should be replaced with Jessica's logic
interface MemberAvatarProps {
    image?: string;
    name: string;
    className?: string;
    fallbackClassName?: string;
}

export const MemberAvatar = ({
    image,
    name,
    className,
    fallbackClassName,
}: MemberAvatarProps) => {
    if (image) {
        return (
            <div className={cn("size-6 relative rounded-full overflow-hidden", className)}>
                <Image src={image} alt={name} fill className="object-cover" />
            </div>
        );
    }

    return (
        <Avatar className={cn("size-6 transition border border-neutral-300 rounded-full", className)}>
            <AvatarFallback
                className={cn(
                    "bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center",
                    fallbackClassName
                )}
            >
                {name.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );
};
