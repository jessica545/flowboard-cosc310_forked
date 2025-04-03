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
        className="w-8 h-8 rounded-md opacity-75 group-hover:opacity-100 transition-opacity"
        data-testid="message-avatar"
      >
        <AvatarFallback 
          className={cn(
            "rounded-md font-semibold text-sm uppercase text-white",
            "bg-blue-600 hover:bg-blue-700 transition-colors"
          )}
        >
          {userInitial}
        </AvatarFallback>
      </Avatar>
      <div className={cn(
        "flex flex-col max-w-3xl",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        <div className="flex items-center gap-2 mb-1 opacity-75 group-hover:opacity-100 transition-opacity">
          <span className="text-sm font-medium text-primary">
            {userName}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </span>
        </div>
        <div className={cn(
          "w-fit max-w-[85%] rounded-2xl px-4 py-2 shadow-sm transition-all duration-200",
          isCurrentUser 
            ? "bg-primary/75 group-hover:bg-primary text-primary-foreground dark:bg-white/60 dark:group-hover:bg-white/70 dark:text-gray-800 rounded-tr-none" 
            : "bg-secondary/75 group-hover:bg-secondary text-primary dark:bg-white/50 dark:group-hover:bg-white/60 dark:text-gray-800 rounded-tl-none"
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
} 