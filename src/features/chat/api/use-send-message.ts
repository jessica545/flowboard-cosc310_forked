'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Message } from '../types';
import { client } from '@/lib/rpc';

interface SendMessageParams {
  conversationId: string;
  content: string;
  senderId?: string; // Optional now as the current user ID will be used from the backend
  username?: string;
  avatar?: string;
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: SendMessageParams): Promise<Message> => {
      try {
        console.log('[useSendMessage] Starting to send message:', {
          conversationId: params.conversationId,
          content: params.content,
          username: params.username
        });
        
        // @ts-expect-error client type is inferred at runtime
        const response = await client.api.chat.messages.$post({
          json: {
            conversationId: params.conversationId,
            content: params.content,
            username: params.username,
            avatar: params.avatar
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[useSendMessage] Error response:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          throw new Error(`Failed to send message: ${response.status} ${errorText}`);
        }
        
        const responseData = await response.json();
        console.log('[useSendMessage] Message sent successfully:', responseData);
        
        return responseData.data;
      } catch (error) {
        console.error('[useSendMessage] Error:', error);
        throw error;
      }
    },
    onSuccess: (newMessage) => {
      console.log('[useSendMessage] Message mutation succeeded:', newMessage);
      
      // Get existing messages
      const existingMessages = queryClient.getQueryData<Message[]>(
        ['messages', newMessage.conversationId]
      ) || [];
      
      console.log('[useSendMessage] Current messages in cache:', existingMessages);
      
      // Update cache directly for immediate UI feedback
      queryClient.setQueryData(
        ['messages', newMessage.conversationId],
        [...existingMessages, newMessage]
      );
      
      console.log('[useSendMessage] Cache updated with new message');
      
      // Update the conversation list to show this conversation has a new message
      const conversationsQueryKeys = queryClient.getQueryCache().findAll(['conversations']);
      conversationsQueryKeys.forEach(query => {
        const conversations = query.state.data as any[] || [];
        if (conversations.length > 0) {
          const updatedConversations = conversations.map(conversation => {
            if (conversation.id === newMessage.conversationId) {
              return {
                ...conversation,
                lastMessage: newMessage,
                updatedAt: new Date().toISOString()
              };
            }
            return conversation;
          });
          queryClient.setQueryData(query.queryKey, updatedConversations);
        }
      });
    },
    onError: (error) => {
      console.error('Message mutation failed:', error);
    }
  });
} 