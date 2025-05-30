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
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50 dark:border-gray-400/20 flex-none">
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
        <div className="p-4 text-sm text-destructive bg-destructive/10 mx-2 mt-2 rounded-md flex-none">
          {error}
        </div>
      )}
      
      <div className="flex-1 min-h-0">
        {isLoading && conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-sm text-muted-foreground dark:text-gray-600">Loading conversations...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-sm text-muted-foreground dark:text-gray-600">No conversations yet</div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="px-2 py-4">
              {conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  onClick={() => onSelect(conversation.id)}
                  className={cn( "w-full py-[15px]",
                    activeConversationId === conversation.id 
                      ? "bg-secondary text-primary" 
                      : "bg-secondary-muted text-muted"
                  )}
                  variant="secondary"
                >
                  <div className='py-6 flex flex-col items-center justify-between'>
                    <div className="font-semibold text-primary">{conversation.name}</div>
                    {conversation.lastMessage && (
                      <div className="text-sm font-medium text-neutral-500">
                        {conversation.lastMessage.content}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
} 