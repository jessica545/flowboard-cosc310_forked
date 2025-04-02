'use client';

import React from "react";
import { ChatContainer } from "@/features/chat/components/chat-container";
import { UserButton } from "@/features/auth/components/user-button";
import { EmailModal } from "@/components/EmailTest";
import { Notifications } from "@/components/notifications";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full bg-primary">
      <nav className="pt-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary flex flex-row items-center justify-between w-full">
          Chat
          <div className="flex items-center gap-x-4 pr-4">
              <Notifications />
              <EmailModal />
              <UserButton />
          </div>
        </h1>
      </nav>
        <p className="text-sm text-neutral-500">Communicate with your team members</p>
      <div className="flex-1 relative">
        <ChatContainer />
      </div>
    </div>
  );
} 