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
      <div className="border-b p-4 flex items-center gap-3 bg-white">
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
      <div className="border-b p-4 flex items-center gap-3 bg-primary">
        <div className="text-muted-foreground">
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
    <div className="border-b p-4 flex items-center gap-3 bg-primary">
      <div className="flex -space-x-2">
        {displayMembers.map((member) => (
          <Avatar key={member.id} className="border-2 border-white rounded-md">
            <AvatarFallback className="text-white bg-blue-600 font-semibold text-lg uppercase rounded-md">
              {member.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {additionalCount > 0 && (
          <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-sm font-medium border-2 border-white">
            +{additionalCount}
          </div>
        )}
      </div>
      <div>
        <h3 className="font-medium">{displayName}</h3>
        <p className="text-sm text-muted-foreground">
          {members.length === 0 
            ? 'No members' 
            : members.length === 1 
              ? '1 member' 
              : `${members.length} members`}
        </p>
      </div>
    </div>
  );
} 