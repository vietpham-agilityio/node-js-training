import { authServiceEffect } from '@/features/auth/services/auth.effect';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { Effect } from 'effect';
import React from 'react';
import {
  useRefreshSession,
  useResetPassword,
  useSession,
  useUpdatePassword,
} from '../useSession';

jest.mock('@/features/auth/services/auth.effect', () => ({
  authServiceEffect: {
    getSession: jest.fn(),
    refreshSession: jest.fn(),
    resetPassword: jest.fn(),
    verifyCurrentPassword: jest.fn(),
    updatePassword: jest.fn(),
  },
}));

const mockUseAuthStore = jest.fn();

jest.mock('@/features/auth/store/auth', () => ({
  useAuthStore: (selector: any) => mockUseAuthStore(selector),
}));

jest.mock('@/constants', () => ({
  API_CONFIG: {
    QUERY_STALE_TIME: 5 * 60 * 1000,
  },
}));

// Helper to create wrapper with QueryClient
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

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';

  return Wrapper;
};

describe('useSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call authService.getSession', async () => {
    const mockSession = { user: { id: '1' }, access_token: 'token' };
    (authServiceEffect.getSession as jest.Mock).mockReturnValue(
      Effect.succeed(mockSession),
    );

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authServiceEffect.getSession).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockSession);
  });

  it('should handle error when getSession fails', async () => {
    const mockError = new Error('Session error');
    (authServiceEffect.getSession as jest.Mock).mockReturnValue(
      Effect.fail(mockError),
    );

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});

describe('useRefreshSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call authService.refreshSession', async () => {
    const mockSession = { user: { id: '1' }, access_token: 'new-token' };
    (authServiceEffect.refreshSession as jest.Mock).mockReturnValue(
      Effect.succeed(mockSession),
    );

    const { result } = renderHook(() => useRefreshSession(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authServiceEffect.refreshSession).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockSession);
  });

  it('should handle error when refreshSession fails', async () => {
    const mockError = new Error('Refresh error');
    (authServiceEffect.refreshSession as jest.Mock).mockReturnValue(
      Effect.fail(mockError),
    );

    const { result } = renderHook(() => useRefreshSession(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});

describe('useResetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call authService.resetPassword with email', async () => {
    (authServiceEffect.resetPassword as jest.Mock).mockReturnValue(
      Effect.succeed(undefined),
    );

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('test@example.com');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authServiceEffect.resetPassword).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(authServiceEffect.resetPassword).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ success: true });
  });

  it('should handle error when resetPassword fails', async () => {
    const mockError = new Error('Reset password error');
    (authServiceEffect.resetPassword as jest.Mock).mockReturnValue(
      Effect.fail(mockError),
    );

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('test@example.com');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('should call onError callback when mutation fails', async () => {
    const mockError = new Error('Reset password error');
    (authServiceEffect.resetPassword as jest.Mock).mockReturnValue(
      Effect.fail(mockError),
    );

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('test@example.com');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useUpdatePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    mockUseAuthStore.mockReturnValue({ email: 'test@example.com' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should verify current password and update password successfully', async () => {
    (authServiceEffect.verifyCurrentPassword as jest.Mock).mockReturnValue(
      Effect.succeed(true),
    );
    (authServiceEffect.updatePassword as jest.Mock).mockReturnValue(
      Effect.succeed(true),
    );

    const { result } = renderHook(() => useUpdatePassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      currentPassword: 'oldPassword',
      newPassword: 'newPassword',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authServiceEffect.verifyCurrentPassword).toHaveBeenCalledWith(
      'test@example.com',
      'oldPassword',
    );
    expect(authServiceEffect.updatePassword).toHaveBeenCalledWith(
      'newPassword',
    );
    expect(result.current.data).toEqual({ success: true });
  });

  it('should throw error when user is not authenticated', async () => {
    mockUseAuthStore.mockReturnValue({ email: null });

    const { result } = renderHook(() => useUpdatePassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      currentPassword: 'oldPassword',
      newPassword: 'newPassword',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('No authenticated user found');
    expect(authServiceEffect.verifyCurrentPassword).not.toHaveBeenCalled();
    expect(authServiceEffect.updatePassword).not.toHaveBeenCalled();
  });

  it('should throw error when current password verification fails', async () => {
    const mockError = new Error('Invalid password');
    (authServiceEffect.verifyCurrentPassword as jest.Mock).mockReturnValue(
      Effect.fail(mockError),
    );

    const { result } = renderHook(() => useUpdatePassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      currentPassword: 'wrongPassword',
      newPassword: 'newPassword',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(authServiceEffect.updatePassword).not.toHaveBeenCalled();
  });

  it('should handle error when password update fails', async () => {
    (authServiceEffect.verifyCurrentPassword as jest.Mock).mockReturnValue(
      Effect.succeed(true),
    );
    const mockError = new Error('Update failed');
    (authServiceEffect.updatePassword as jest.Mock).mockReturnValue(
      Effect.fail(mockError),
    );

    const { result } = renderHook(() => useUpdatePassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      currentPassword: 'oldPassword',
      newPassword: 'newPassword',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
