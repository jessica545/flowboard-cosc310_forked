'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Conversation } from '../types';
import { client } from '@/lib/rpc';

interface CreateConversationParams {
  workspaceId: string;
  name: string;
  memberIds: string[];
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: CreateConversationParams): Promise<Conversation> => {
      // @ts-expect-error client type is inferred at runtime
      const response = await client.api.chat.conversations.$post({
        json: params
      });
      
      if (!response.ok) throw new Error('Failed to create conversation');
      
      const { data } = await response.json();
      return data;
    },
    onSuccess: (newConversation) => {
      // Get existing conversations
      const existingConversations = queryClient.getQueryData<Conversation[]>(
        ['conversations', newConversation.workspaceId]
      ) || [];
      
      // Update cache directly for immediate UI feedback
      queryClient.setQueryData(
        ['conversations', newConversation.workspaceId],
        [...existingConversations, newConversation]
      );
    },
  });
} 