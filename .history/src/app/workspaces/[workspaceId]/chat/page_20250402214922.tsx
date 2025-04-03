'use client';

import React from "react";
import { ChatContainer } from "@/features/chat/components/chat-container";
import { UserButton } from "@/features/auth/components/user-button";
import { EmailModal } from "@/components/EmailTest";
import { Notifications } from "@/components/notifications";

export default function ChatPage() {
    return (
        <main className="bg-primary min-h-screen">
            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center h-[73px] mb-4 rounded-lg bg-primary shadow-sm">
                    <UserButton/>
                </nav>
                <div className="flex flex-col items-center justify-center py-4">
                    {children}
                </div>
            </div>
            <div className="flex flex-col h-full">
                <nav className="flex justify-between items-center h-[73px] mb-4 rounded-lg bg-primary shadow-sm">
                    <div className="p-4 pb-2 border-b">
                        <h1 className="text-2xl font-semibold text-primary">Chat</h1>
                        <p className="text-sm text-neutral-500">Communicate with your team members</p>
                    </div>
                    <div className="flex flex-row items-center justify-center px-4 mx-4">
                        <Notifications/>
                        <EmailModal/>
                        <UserButton/>
                    </div>
                </nav>
                <div className="flex-1 relative">
                    <ChatContainer />
                </div>
            </div>
        </main>
    );
} 