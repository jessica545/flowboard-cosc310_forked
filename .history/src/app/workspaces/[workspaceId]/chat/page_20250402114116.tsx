'use client';

import React from "react";
import { ChatContainer } from "@/features/chat/components/chat-container";
import { UserButton } from "@/features/auth/components/user-button";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full bg-primary">
      <nav className="pt-4 px-6 border-b">
        <div className="flex-col hidden lg:flex">
          <h1 className="text-2xl font-semibold text-primary">Chat</h1>
          <p className="text-sm text-muted-foreground">Communicate with your team members</p>
        </div>
        <div className="flex items-center gap-x-4 pr-4">
            <UserButton />
        </div>
      </nav>
      <div className="flex-1 relative">
        <ChatContainer />
      </div>
    </div>
  );
} 