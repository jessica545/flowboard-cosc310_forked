'use client';

import React from "react";
import { ChatContainer } from "@/features/chat/components/chat-container";
import { UserButton } from "@/features/auth/components/user-button";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full bg-primary">
      <nav className="pt-4 px-6 border-b">
        <h1 className="text-2xl font-semibold text-primary lg:flex flex-row items-center justify-between w-full">
          Chat
          <div className="flex items-center gap-x-4 pr-4">
              <UserButton />
          </div>
        </h1>
        <p className="text-sm text-neutral-500 mb-2">Communicate with your team members</p>
      </nav>
      <div className="flex-1 relative">
        <ChatContainer />
      </div>
    </div>
  );
} 