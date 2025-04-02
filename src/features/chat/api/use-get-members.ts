'use client';

import { useQuery } from '@tanstack/react-query';
import { User } from '../types';
import { client } from '@/lib/rpc';

// This function leverages the existing members API
export function useGetMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['members', workspaceId],
    queryFn: async () => {
      try {
        // @ts-expect-error client type is known at runtime
        const response = await client.api.members.$get({ query: { workspaceId } });
        if (!response.ok) throw new Error('Failed to fetch members');
        
        const { data } = await response.json();
        
        // Check if data and documents exist and are valid
        if (!data || !data.documents || !Array.isArray(data.documents)) {
          console.error('Invalid members data structure:', data);
          return [];
        }
        
        console.log('Raw members data from API:', data.documents);
        
        // Transform the members data to match our chat User type
        const members: User[] = data.documents.map((member: any) => {
          // IMPORTANT: Use userId for consistent ID handling
          // This matches the ID used in authorization checks
          const memberId = member.userId || 'unknown-id';
          
          console.log('Processing member:', {
            raw: member,
            transformedId: memberId,
            name: member.name || 'Unknown User'
          });
          
          return {
            id: memberId, // Use userId for consistency
            name: member.name || 'Unknown User', 
            email: member.email,
            // Use any available avatar or a placeholder
            avatar: member.avatar || '', // Allow empty avatar
          };
        });
        
        return members;
      } catch (error) {
        console.error('Error fetching members:', error);
        return []; // Return empty array on error
      }
    },
    enabled: !!workspaceId,
  });
} 