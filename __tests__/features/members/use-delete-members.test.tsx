import React from 'react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { faker } from '@faker-js/faker';
import type { ReactNode } from 'react';
import { client } from '@/lib/rpc';
import { useDeleteMember } from '@/features/members/api/use-delete-members';

type MockClient = {
  api: {
    members: {
      ':memberId': {
        $delete: ReturnType<typeof jest.fn>;
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
          $delete: jest.fn(),
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

describe('useDeleteMember', () => {
  const mockMemberId = faker.string.uuid();
  const mockedClient = client as unknown as MockClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete member successfully', async () => {
    // Arrange
    const mockResponse = {
      ok: true,
      json: async () => ({ success: true }),
    };
    jest.mocked(mockedClient.api.members[':memberId'].$delete).mockResolvedValueOnce(mockResponse);

    // Act
    const { result } = renderHook(
      () => useDeleteMember(),
      { wrapper: createWrapper() }
    );

    // Assert
    expect(result.current.isPending).toBe(false);

    await result.current.mutateAsync({
      param: { memberId: mockMemberId },
    });

    expect(mockedClient.api.members[':memberId'].$delete).toHaveBeenCalledTimes(1);
    expect(mockedClient.api.members[':memberId'].$delete).toHaveBeenCalledWith({
      param: { memberId: mockMemberId },
    });
  });

  it('should handle error when deleting member', async () => {
    // Arrange
    const mockResponse = {
      ok: false,
    };
    jest.mocked(mockedClient.api.members[':memberId'].$delete).mockResolvedValueOnce(mockResponse);

    // Act
    const { result } = renderHook(
      () => useDeleteMember(),
      { wrapper: createWrapper() }
    );

    // Assert
    await expect(
      result.current.mutateAsync({
        param: { memberId: mockMemberId },
      })
    )
      .rejects
      .toThrow('Failed to delete member');
  });

  it('should show loading state during deletion', async () => {
    // Arrange
    const mockResponse = {
      ok: true,
      json: async () => ({ success: true }),
    };
    jest.mocked(mockedClient.api.members[':memberId'].$delete).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
    );

    // Act
    const { result } = renderHook(
      () => useDeleteMember(),
      { wrapper: createWrapper() }
    );

    // Assert
    expect(result.current.isPending).toBe(false);
    
    result.current.mutate({
      param: { memberId: mockMemberId },
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