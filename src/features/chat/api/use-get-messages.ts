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
        console.log('[useGetMessages] Fetching messages:', {
          conversationId,
          timestamp: new Date().toISOString()
        });
        
        // @ts-expect-error client type is inferred at runtime
        const response = await client.api.chat.messages.$get({ 
          query: { conversationId } 
        });
        
        if (!response.ok) {
          console.error('[useGetMessages] Error response:', {
            status: response.status,
            statusText: response.statusText,
            conversationId
          });
          throw new Error('Failed to fetch messages');
        }
        
        const responseData = await response.json();
        console.log('[useGetMessages] Received messages:', {
          count: responseData.data?.length || 0,
          conversationId,
          timestamp: new Date().toISOString()
        });
        
        return responseData.data || [];
      } catch (error) {
        console.error('[useGetMessages] Error:', {
          error,
          conversationId,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    },
    enabled: !!conversationId,
    refetchInterval: 1000, // Poll every 1 second for new messages
  });
} 