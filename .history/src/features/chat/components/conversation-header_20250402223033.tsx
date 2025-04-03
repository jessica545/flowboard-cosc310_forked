'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation, User } from '../types';

interface ConversationHeaderProps {
  conversation?: Conversation;
  members?: User[];
  isLoading?: boolean;
}

export function ConversationHeader({
  conversation,
  members = [],
  isLoading = false
}: ConversationHeaderProps) {
  if (isLoading) {
    return (
      <div className="border-b p-4 flex items-center gap-3 bg-primary">
        <div className="animate-pulse w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="animate-pulse h-4 w-1/4 bg-gray-200 rounded mb-2" />
          <div className="animate-pulse h-3 w-1/3 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="border-b p-4 flex items-center gap-3 bg-secondary m-2 rounded-md border-1">
        <div className="text-muted-foreground dark:text-gray-600">
          Select or create a conversation to start chatting
        </div>
      </div>
    );
  }

  // Determine if this is a 1:1 conversation or a group chat
  const isSingleUserChat = members.length === 1;
  
  // For single user chat, use the member's name instead of conversation name
  const displayName = isSingleUserChat && members[0]
    ? members[0].name
    : conversation.name;
    
  // For display avatars, use the first 2 members for visual representation
  const displayMembers = members.slice(0, 2);
  const additionalCount = Math.max(0, members.length - 2);

  return (
    <div className="border-b border-border/50 dark:border-gray-400/20 p-4 flex items-center gap-3 bg-background dark:bg-[#DFDFDF]">
      <div className="flex gap-1">
        {displayMembers.map((member) => (
          <Avatar key={member.id} className="w-8 h-8 rounded-md">
            <AvatarFallback className="rounded-md font-semibold text-sm uppercase text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              {member.name[0]}
            </AvatarFallback>
          </Avatar>
        ))}
        {additionalCount > 0 && (
          <div className="w-8 h-8 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium text-white">
            +{additionalCount}
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-primary dark:text-gray-800">{displayName}</h3>
        <p className="text-sm text-muted-foreground dark:text-gray-600">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </p>
      </div>
    </div>
  );
} 