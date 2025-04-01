import React from 'react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { faker } from '@faker-js/faker';
import type { ReactNode } from 'react';
import { client } from '@/lib/rpc';
import { useUpdateMember } from '@/features/members/api/use-update-members';
import { MemberRole } from '@/features/members/types';

type MockClient = {
  api: {
    members: {
      ':memberId': {
        $patch: ReturnType<typeof jest.fn>;
      };
    };
  };
};

// Mock the RPC client
jest.mock('@/lib/rpc', () => ({
  client: {
    api: {
      members: {
        ':memberId': {
          $patch: jest.fn(),
        },
      },
    },
  },
}));

// Test wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
};

describe('useUpdateMember', () => {
  const mockMemberId = faker.string.uuid();
  const mockedClient = client as unknown as MockClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update member role successfully', async () => {
    // Arrange
    const mockResponse = {
      ok: true,
      json: async () => ({ success: true }),
    };
    jest.mocked(mockedClient.api.members[':memberId'].$patch).mockResolvedValueOnce(mockResponse);

    // Act
    const { result } = renderHook(
      () => useUpdateMember(),
      { wrapper: createWrapper() }
    );

    // Assert
    expect(result.current.isPending).toBe(false);

    await result.current.mutateAsync({
      param: { memberId: mockMemberId },
      json: { role: MemberRole.MEMBER },
    });

    expect(mockedClient.api.members[':memberId'].$patch).toHaveBeenCalledTimes(1);
    expect(mockedClient.api.members[':memberId'].$patch).toHaveBeenCalledWith({
      param: { memberId: mockMemberId },
      json: { role: MemberRole.MEMBER },
    });
  });

  it('should handle error when updating member', async () => {
    // Arrange
    const mockResponse = {
      ok: false,
    };
    jest.mocked(mockedClient.api.members[':memberId'].$patch).mockResolvedValueOnce(mockResponse);

    // Act
    const { result } = renderHook(
      () => useUpdateMember(),
      { wrapper: createWrapper() }
    );

    // Assert
    await expect(
      result.current.mutateAsync({
        param: { memberId: mockMemberId },
        json: { role: MemberRole.MEMBER },
      })
    )
      .rejects
      .toThrow('Failed to update member');
  });

  it('should show loading state during update', async () => {
    // Arrange
    const mockResponse = {
      ok: true,
      json: async () => ({ success: true }),
    };
    jest.mocked(mockedClient.api.members[':memberId'].$patch).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
    );

    // Act
    const { result } = renderHook(
      () => useUpdateMember(),
      { wrapper: createWrapper() }
    );

    // Assert
    expect(result.current.isPending).toBe(false);
    
    result.current.mutate({
      param: { memberId: mockMemberId },
      json: { role: MemberRole.MEMBER },
    });

    // Wait for the loading state to be true
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Wait for the loading state to be false
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
}); 