import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUsers, useCreateUser, QUERY_KEYS } from '../../client/src/hooks/use-api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import * as apiModule from '../../client/src/lib/api-new';

// Mock da API
vi.mock('../../client/src/lib/api-new', () => ({
  api: {
    getUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

// Mock do toast
vi.mock('../../client/src/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUsers Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch users successfully', async () => {
    const mockUsers = [
      { id: '1', name: 'User 1', email: 'user1@test.com', role: 'user' },
      { id: '2', name: 'User 2', email: 'user2@test.com', role: 'admin' },
    ];

    vi.mocked(apiModule.api.getUsers).mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUsers);
    expect(apiModule.api.getUsers).toHaveBeenCalledTimes(1);
  });

  it('should handle error when fetching users fails', async () => {
    const error = new Error('Failed to fetch users');
    vi.mocked(apiModule.api.getUsers).mockRejectedValue(error);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });
});

describe('useCreateUser Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create user successfully', async () => {
    const newUser = {
      name: 'New User',
      email: 'newuser@test.com',
      role: 'user' as const,
      password: 'password123',
    };

    const createdUser = { ...newUser, id: '3' };
    vi.mocked(apiModule.api.createUser).mockResolvedValue(createdUser);

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newUser);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiModule.api.createUser).toHaveBeenCalledWith(newUser);
    expect(result.current.data).toEqual(createdUser);
  });

  it('should handle error when creating user fails', async () => {
    const error = new Error('Failed to create user');
    vi.mocked(apiModule.api.createUser).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    const newUser = {
      name: 'New User',
      email: 'newuser@test.com',
      role: 'user' as const,
      password: 'password123',
    };

    result.current.mutate(newUser);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });
});
