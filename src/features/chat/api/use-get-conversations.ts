'use client';

import { useQuery } from '@tanstack/react-query';
import { Conversation } from '../types';
import { client } from '@/lib/rpc';

export function useGetConversations(workspaceId: string) {
  return useQuery({
    queryKey: ['conversations', workspaceId],
    queryFn: async () => {
      // @ts-expect-error client type is inferred at runtime
      const response = await client.api.chat.conversations.$get({ query: { workspaceId } });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const { data } = await response.json();
      return data || [];
    },
    enabled: !!workspaceId,
    refetchInterval: 5000, // Poll every 5 seconds for new conversations
  });
} 