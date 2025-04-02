"use client";
import React, { useState } from "react";
import { Tab } from "@headlessui/react";
import { CreateWorkspaceForm } from "./create-workspace-form";
import { JoinByLinkForm } from "./join-by-link-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon, LinkIcon } from "lucide-react";

interface WorkspaceOptionsProps {
    onCancel?: () => void;
}

export const WorkspaceOptions = ({ onCancel }: WorkspaceOptionsProps) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <div className="w-full">
            <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                <Tab.List className="flex space-x-2 rounded-xl text-primary p-2 mb-4">
                    <Tab
                        className={({ selected }: { selected: boolean }) =>
                            cn(
                                'w-full py-2.5 text-sm font-medium leading-5 rounded-lg',
                                'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                selected
                                    ? 'bg-primary text-primary-foreground shadow'
                                    : 'text-primary hover:bg-white/[0.12] hover:text-primary'
                            )
                        }
                    >
                        <div className="flex items-center justify-center gap-2">
                            <PlusCircleIcon className="size-4" />
                            <span>Create New</span>
                        </div>
                    </Tab>
                    <Tab
                        className={({ selected }: { selected: boolean }) =>
                            cn(
                                'w-full py-2.5 text-sm font-medium leading-5 rounded-lg bg-primary',
                                'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                selected
                                    ? 'bg-primary text-primary-foreground shadow'
                                    : 'text-primary hover:bg-white/[0.12] hover:text-primary'
                            )
                        }
                    >
                        <div className="flex items-center justify-center gap-2">
                            <LinkIcon className="size-4" />
                            <span>Join Existing</span>
                        </div>
                    </Tab>
                </Tab.List>
                <Tab.Panels>
                    <Tab.Panel>
                        <CreateWorkspaceForm onCancel={onCancel} />
                    </Tab.Panel>
                    <Tab.Panel>
                        <JoinByLinkForm onCancel={onCancel} />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
}; 