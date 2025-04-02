'use client';

import { useQuery } from '@tanstack/react-query';
import { Message } from '../types';
import { client } from '@/lib/rpc';

export function useGetMessages(conversationId?: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async (): Promise<Message[]> => {
      if (!conversationId) return [];
      
      try {
        console.log('Fetching messages for conversation:', conversationId);
        
        // @ts-expect-error client type is inferred at runtime
        const response = await client.api.chat.messages.$get({ 
          query: { conversationId } 
        });
        
        if (!response.ok) {
          console.error('Error fetching messages:', response.status, response.statusText);
          throw new Error('Failed to fetch messages');
        }
        
        const responseData = await response.json();
        console.log('Messages response:', responseData);
        
        return responseData.data || [];
      } catch (error) {
        console.error('Error in useGetMessages:', error);
        throw error;
      }
    },
    enabled: !!conversationId,
    refetchInterval: 1000, // Poll every 1 second for new messages
  });
} 