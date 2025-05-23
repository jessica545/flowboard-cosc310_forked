'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from '../types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const userName = message.username || (isCurrentUser ? "You" : "User");
  const userInitial = userName[0].toUpperCase();
  
  return (
    <div 
      className={cn(
        "flex gap-3 w-full group",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
      data-testid={`message-${message.id}`}
    >
      <Avatar 
        className="w-8 h-8 rounded-md"
        data-testid="message-avatar"
      >
        <AvatarFallback 
          className={cn(
            "text-primary font-semibold text-sm uppercase rounded-md",
            isCurrentUser
              ? "bg-[var(--primary)] text-white"
              : "bg-tertiary"
          )}
        >
          {userInitial}
        </AvatarFallback>
      </Avatar>
      <div className={cn(
        "flex flex-col max-w-3xl",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-primary">
            {userName}
          </span>
          <span className="text-xs text-neutral-400">
            {new Date(message.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </span>
        </div>
        <div className={cn(
          "w-fit max-w-[85%] rounded-2xl px-4 py-2",
          isCurrentUser 
            ? "bg-[var(--primary)] text-white rounded-tr-none" 
            : "bg-tertiary text-primary dark:text-white rounded-tl-none"
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
} 