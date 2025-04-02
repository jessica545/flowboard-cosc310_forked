"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import{
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import Link from "next/link";
import { useJoinWorkspace } from "../api/use-join-workspace";
import { useInviteCode } from "../hooks/use-invite-code";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface JoinWorkspaceFormProps {
    initialValues: {
        name: string;
    };
}

export const JoinWorkspaceForm = ({ initialValues }: JoinWorkspaceFormProps) => {
    const [error, setError] = useState<string | null>(null);
    const inviteCode = useInviteCode();
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const { mutate, isPending } = useJoinWorkspace();

    const onSubmit = () => {
        setError(null);
        
        if (!inviteCode || !workspaceId) {
            setError("Missing invitation information. The URL may be invalid.");
            return;
        }

        mutate(
            {
                param: { workspaceId },
                json: { code: inviteCode },
            },
            {
                onError: (err) => {
                    setError(err.message || "Failed to join workspace");
                }
            }
        );
    };

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="p-7">
                <CardTitle className="text-xl font-bold">Join Workspace</CardTitle>
                <CardDescription>
                    <p>
                        You've been invited to join <strong>{initialValues.name}</strong> workspace.
                    </p>
                    {error && (
                        <p className="text-destructive font-medium mt-2">{error}</p>
                    )}
                </CardDescription>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
                    <Button 
                        variant="secondary" 
                        type="button" 
                        asChild 
                        size="lg" 
                        className="w-full lg:w-fit" 
                        disabled={isPending}
                    >
                        <Link href="/">Cancel</Link>
                    </Button>
                    <Button 
                        size="lg" 
                        className="w-full lg:w-fit" 
                        type="button" 
                        onClick={onSubmit} 
                        disabled={isPending}
                    >
                        {isPending ? "Joining..." : "Join Workspace"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default JoinWorkspaceForm;
