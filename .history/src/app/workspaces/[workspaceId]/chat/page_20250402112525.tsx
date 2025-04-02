'use client';

import React from "react";
import { ChatContainer } from "@/features/chat/components/chat-container";
import { UserButton } from "@/features/auth/components/user-button";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full bg-primary">
      <div className="p-4 pb-2 border-b">
        <h1 className="text-2xl font-semibold text-primary flex flex-row items-center justify-between w-full">
          <UserButton />
          Chat
        </h1>
        <p className="text-sm text-neutral-500">Communicate with your team members</p>
      </div>
      <div className="flex-1 relative">
        <ChatContainer />
      </div>
    </div>
  );
} 