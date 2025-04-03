'use client';

import React from "react";
import { ChatContainer } from "@/features/chat/components/chat-container";
import { UserButton } from "@/features/auth/components/user-button";

export default function ChatPage() {
    return (
        <div className="flex flex-col h-full">
            <nav className="flex justify-between items-center h-[73px] mb-4 rounded-lg bg-primary shadow-sm">
                <UserButton/>
                <div className="p-4 pb-2 border-b">
                    <h1 className="text-2xl font-semibold text-primary">Chat</h1>
                    <p className="text-sm text-neutral-500">Communicate with your team members</p>
                </div>
            </nav>
            <div className="flex-1 relative">
                <ChatContainer />
            </div>
        </div>
    );
} 