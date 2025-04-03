'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { Conversation } from '../types';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  isLoading?: boolean;
  error?: string | null;
  activeConversationId?: string;
  onSelect: (conversationId: string) => void;
  onCreateNew: () => void;
}

export function ConversationList({
  conversations = [],
  isLoading = false,
  error = null,
  activeConversationId,
  onSelect,
  onCreateNew
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full border-r text-primary">
      <div className="p-4 border-b">
        <Button 
          onClick={onCreateNew} 
          className="w-full" 
          variant="secondary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>
      
      {error && (
        <div className="p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      
        {isLoading && conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-sm text-muted-foreground">Loading conversations...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center flex-1 p-4">
            <div className="text-sm text-muted-foreground">No conversations yet</div>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="px-2 py-1">
              {conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  onClick={() => onSelect(conversation.id)}
                  variant="secondary"
                  className={cn( "w-full",
                    activeConversationId === conversation.id, "w-full h-full flex flex-col py-2"
                  )}
                >
                    <div className="font-bold">{conversation.name}</div>
                    {conversation.lastMessage && (
                      <div className="text-sm font-medium text-muted truncate">
                        {conversation.lastMessage.content}
                      </div>
                    )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
  );
} 