"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const joinLinkSchema = z.object({
    inviteLink: z.string().url("Please enter a valid URL")
});

type JoinLinkFormValues = z.infer<typeof joinLinkSchema>;

interface JoinByLinkFormProps {
    onCancel?: () => void;
}

export const JoinByLinkForm = ({ onCancel }: JoinByLinkFormProps) => {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    
    const form = useForm<JoinLinkFormValues>({
        resolver: zodResolver(joinLinkSchema),
        defaultValues: {
            inviteLink: ""
        }
    });

    const onSubmit = (values: JoinLinkFormValues) => {
        setError(null);
        
        try {
            // Extract workspaceId and inviteCode from the URL
            const url = new URL(values.inviteLink);
            const pathParts = url.pathname.split('/');
            
            // Find "workspaces" in the path
            const workspacesIndex = pathParts.findIndex(part => part === "workspaces");
            
            if (workspacesIndex === -1 || workspacesIndex >= pathParts.length - 2) {
                setError("Invalid invite link format");
                return;
            }
            
            const workspaceId = pathParts[workspacesIndex + 1];
            const inviteCode = pathParts[workspacesIndex + 3]; // +3 because we have /workspaces/:id/join/:code
            
            if (!workspaceId || !inviteCode) {
                setError("Invalid invite link");
                return;
            }
            
            // Navigate to the join page with the extracted parameters
            router.push(`/workspaces/${workspaceId}/join/${inviteCode}`);
            
        } catch (err) {
            setError("Could not process the invite link");
        }
    };

    return (
        <Card className="w-full h-full border-none shadow-none bg-primary text-primary">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">Join existing workspace</CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-y-4">
                            <FormField
                                name="inviteLink"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Paste Invite Link</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="https://example.com/workspaces/123/join/abc123" 
                                                className="bg-secondary rounded-md shadow-none border-1"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {error && (
                                <p className="text-destructive text-sm">{error}</p>
                            )}
                        </div>

                        <DottedSeparator className="py-7" />
                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                size="lg"
                                variant="secondary"
                                onClick={onCancel}
                                className={!onCancel ? "invisible" : ""}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="lg"
                                variant="primary"
                                disabled={form.formState.isSubmitting}
                            >
                                Join Workspace
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}; 