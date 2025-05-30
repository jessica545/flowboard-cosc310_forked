'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { ConversationList } from './conversation-list';
import { ConversationHeader } from './conversation-header';
import { CreateConversation } from './create-conversation';
import { useCreateConversationModal } from '../hooks/use-create-conversation-modal';
import { MessageFormData } from '../types';
import { useGetConversations } from '../api/use-get-conversations';
import { useGetMessages } from '../api/use-get-messages';
import { useGetMembers } from '../api/use-get-members';
import { useCreateConversation } from '../api/use-create-conversation';
import { useSendMessage } from '../api/use-send-message';
import { useCurrent } from '@/features/auth/api/use-current';
import { Conversation } from '../types';

export function ChatContainer() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  // Get current user
  const { data: currentUser } = useCurrent();
  
  // State
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const createConversationModal = useCreateConversationModal();
  
  // Queries
  const { 
    data: conversations = [], 
    isLoading: isLoadingConversations,
    error: conversationsError 
  } = useGetConversations(workspaceId);
  
  const { 
    data: messages = [], 
    isLoading: isLoadingMessages,
    error: messagesError 
  } = useGetMessages(activeConversationId || undefined);
  
  const { 
    data: members = [], 
    isLoading: isLoadingMembers 
  } = useGetMembers(workspaceId);
  
  // Mutations
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();
  
  // Derived state
  const activeConversation = conversations.find((c: Conversation) => c.id === activeConversationId);
  
  // Filter members based on the active conversation's memberIds
  const conversationMembers = React.useMemo(() => {
    if (!activeConversation || !activeConversation.memberIds || !Array.isArray(members)) {
      return [];
    }
    
    // Filter members to only include those in the active conversation
    return members.filter(member => 
      activeConversation.memberIds?.includes(member.id)
    );
  }, [activeConversation, members]);
  
  // Filter out the current user from available members
  const availableMembers = React.useMemo(() => {
    if (!Array.isArray(members)) return [];
    
    console.log('All members:', members);
    console.log('Current user:', currentUser);
    
    // If we have the current user, only filter out the current user, not other members
    if (currentUser) {
      return members.filter(member => {
        // Only filter out exact ID match for current user
        if (currentUser.$id && member.id === currentUser.$id) {
          return false;
        }
        
        return true;
      });
    }
    
    return members;
  }, [members, currentUser]);
  
  // Select the first conversation by default if none is selected
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  // Force refresh messages every 2 seconds
  useEffect(() => {
    if (!activeConversationId) return;
    
    // Remove the manual polling since useGetMessages already has a polling mechanism
    const cleanup = () => {
      // Cleanup any subscriptions or side effects if needed
    };
    
    return cleanup;
  }, [activeConversationId]);
  
  // Event handlers
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };
  
  const handleCreateConversation = async (name: string, memberIds: string[]) => {
    try {
      const newConversation = await createConversation.mutateAsync({
        name,
        workspaceId,
        memberIds,
      });
      
      // Select the newly created conversation
      setActiveConversationId(newConversation.id);
      
      // Close the modal
      createConversationModal.close();
    } catch (error) {
      console.error('[ChatContainer] Error creating conversation:', error);
      // You might want to show an error toast or message here
    }
  };
  
  const handleSendMessage = async (data: MessageFormData) => {
    if (!activeConversationId || !currentUser) {
      console.error('[ChatContainer] Cannot send message: missing conversation ID or user');
      return;
    }
    
    try {
      await sendMessage.mutateAsync({
        conversationId: activeConversationId,
        content: data.content,
        senderId: currentUser.$id,
        username: currentUser.name,
        avatar: currentUser.avatarUrl || 'https://github.com/shadcn.png'
      });
    } catch (error) {
      console.error('[ChatContainer] Error sending message:', error);
      // You might want to show an error toast or message here
    }
  };
  
  // Loading states
  const isSending = sendMessage.isPending;
  const isCreating = createConversation.isPending;
  
  // Error handling
  const error = messagesError 
    ? 'Failed to load messages' 
    : conversationsError 
      ? 'Failed to load conversations' 
      : null;
  
  // Display empty state when there are no messages for the active conversation
  const showEmptyState = activeConversationId && !isLoadingMessages && messages.length === 0;

  // After a conversation is created, we should enable the input field even before messages are loaded
  const inputDisabled = !activeConversationId;

  return (
    <div className="flex flex-col h-full">
      {/* Chat Layout */}
      <div className="flex flex-1 h-full">
        {/* Conversations sidebar */}
        <div className="w-72 h-full border-r border-border flex-shrink-0 bg-secondary/50 dark:bg-[#DFDFDF]">
          <ConversationList
            conversations={conversations}
            isLoading={isLoadingConversations}
            error={conversationsError ? 'Failed to load conversations' : null}
            activeConversationId={activeConversationId || undefined}
            onSelect={handleSelectConversation}
            onCreateNew={createConversationModal.open}
          />
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col h-full bg-background dark:bg-[#DFDFDF]">
          <ConversationHeader
            conversation={activeConversation}
            members={conversationMembers}
            isLoading={isLoadingMembers}
          />
          
          {/* Display empty state when no messages */}
          {showEmptyState ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="max-w-md p-6 bg-secondary/50 dark:bg-white/10 rounded-lg border border-border/50">
                <h3 className="text-lg font-medium text-primary dark:text-gray-800 mb-2">No messages yet</h3>
                <p className="text-muted-foreground dark:text-gray-600">
                  Start a conversation by sending a message below.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-background/50 dark:bg-[#DFDFDF] px-4" data-testid="message-list-container">
              <MessageList 
                messages={messages}
                isLoading={isLoadingMessages}
                error={messagesError ? 'Failed to load messages' : null}
              />
            </div>
          )}
          
          <div className="border-t border-border/50 bg-background/50 dark:bg-[#DFDFDF] p-4" data-testid="message-input">
            <MessageInput 
              onSubmit={handleSendMessage}
              isLoading={isSending}
              error={error}
              disabled={inputDisabled}
            />
          </div>
        </div>
      </div>

      {/* Create conversation modal */}
      <CreateConversation
        isOpen={createConversationModal.isOpen || false}
        onClose={createConversationModal.close}
        onCreateConversation={handleCreateConversation}
        availableMembers={availableMembers}
        isLoading={isCreating}
      />
    </div>
  );
} 