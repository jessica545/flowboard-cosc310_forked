import React from 'react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { faker } from '@faker-js/faker';
import type { ReactNode } from 'react';
import { client } from '@/lib/rpc';
import { useGetMembers } from '@/features/members/api/use-get-members';

type MockClient = {
  api: {
    members: {
      $get: ReturnType<typeof jest.fn>;
    };
  };
};

// Mock the RPC client
jest.mock('@/lib/rpc', () => ({
  client: {
    api: {
      members: {
        $get: jest.fn(),
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

describe('useGetMembers', () => {
  const mockWorkspaceId = faker.string.uuid();
  const mockedClient = client as unknown as MockClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch members successfully', async () => {
    // Arrange
    const mockMembers = [
      {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: 'MEMBER',
      },
      {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: 'ADMIN',
      },
    ];
    const mockResponse = {
      ok: true,
      json: async () => ({ data: mockMembers }),
    };
    jest.mocked(mockedClient.api.members.$get).mockResolvedValueOnce(mockResponse);

    // Act
    const { result } = renderHook(
      () => useGetMembers({ workspaceId: mockWorkspaceId }),
      { wrapper: createWrapper() }
    );

    // Assert
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockMembers);
    });

    expect(mockedClient.api.members.$get).toHaveBeenCalledTimes(1);
    expect(mockedClient.api.members.$get).toHaveBeenCalledWith({
      query: { workspaceId: mockWorkspaceId },
    });
  });

  it('should handle error when fetching members', async () => {
    // Arrange
    const mockResponse = {
      ok: false,
    };
    jest.mocked(mockedClient.api.members.$get).mockResolvedValueOnce(mockResponse);

    // Act
    const { result } = renderHook(
      () => useGetMembers({ workspaceId: mockWorkspaceId }),
      { wrapper: createWrapper() }
    );

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(new Error('Failed to fetch members'));
    });
  });

  it('should show loading state while fetching', async () => {
    // Arrange
    const mockMembers = [
      {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: 'MEMBER',
      },
    ];
    const mockResponse = {
      ok: true,
      json: async () => ({ data: mockMembers }),
    };
    jest.mocked(mockedClient.api.members.$get).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
    );

    // Act
    const { result } = renderHook(
      () => useGetMembers({ workspaceId: mockWorkspaceId }),
      { wrapper: createWrapper() }
    );

    // Assert
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockMembers);
    });
  });
}); 