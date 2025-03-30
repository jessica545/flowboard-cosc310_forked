import React from "react";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";

export function ChatContainer() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto" data-testid="message-list">
        <MessageList />
      </div>
      <div data-testid="message-input">
        <MessageInput />
      </div>
    </div>
  );
} 