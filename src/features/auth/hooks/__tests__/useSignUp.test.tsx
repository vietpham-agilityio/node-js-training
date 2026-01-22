import { AuthenticationError } from '@/features/auth/error/auth';
import { authServiceEffect } from '@/features/auth/services/auth.effect';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { Effect } from 'effect';
import React from 'react';
import { useSignUp } from '../useSignUp';

// Mock dependencies
const mockToastAlert = jest.fn();

jest.mock('@/features/auth/services/auth.effect', () => ({
  authServiceEffect: {
    signUp: jest.fn(),
  },
}));

jest.mock('@/hooks/useToast', () => ({
  useToastAlert: () => ({
    alert: mockToastAlert,
  }),
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

describe('useSignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call authServiceEffect.signUp with correct data', async () => {
    const signUpData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      avatarUrl: 'https://example.com/avatar.jpg',
    };
    const mockResponse = { user: { id: '1' } };
    (authServiceEffect.signUp as jest.Mock).mockReturnValue(
      Effect.succeed(mockResponse),
    );

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(signUpData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authServiceEffect.signUp).toHaveBeenCalledWith(signUpData);
    expect(authServiceEffect.signUp).toHaveBeenCalledTimes(1);
  });

  it('should show success toast on success', async () => {
    const signUpData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    };
    const mockResponse = { user: { id: '1' } };
    (authServiceEffect.signUp as jest.Mock).mockReturnValue(
      Effect.succeed(mockResponse),
    );

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(signUpData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockToastAlert).toHaveBeenCalledWith(
      'Sign up successful',
      'Account created successfully! Please check your email to verify your account.',
      [],
      {
        type: 'success',
      },
    );
  });

  it('should show error toast with error message when signUp fails with Error', async () => {
    const signUpData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    };
    const mockError = new Error('Email already exists');
    (authServiceEffect.signUp as jest.Mock).mockReturnValue(
      Effect.fail(mockError),
    );

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(signUpData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockToastAlert).toHaveBeenCalledWith(
      'Sign Up Failed',
      'Email already exists',
      [],
      {
        type: 'error',
      },
    );
  });

  it('should show error toast with AuthenticationError message', async () => {
    const signUpData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    };
    const mockError = AuthenticationError.signUpFailed(
      'Email already registered',
    );
    (authServiceEffect.signUp as jest.Mock).mockReturnValue(
      Effect.fail(mockError),
    );

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(signUpData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Verify the error is an instance of AuthenticationError
    expect(result.current.error).toBeInstanceOf(AuthenticationError);
    expect((result.current.error as AuthenticationError).message).toBe(
      'Email already registered',
    );

    expect(mockToastAlert).toHaveBeenCalledWith(
      'Sign Up Failed',
      'Email already registered',
      [],
      {
        type: 'error',
      },
    );
  });

  it('should show default error message when AuthenticationError has empty message', async () => {
    const signUpData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    };
    // Empty message should trigger fallback to ERROR_MESSAGES.SIGNUP_FAILED
    const mockError = AuthenticationError.signUpFailed('');
    (authServiceEffect.signUp as jest.Mock).mockReturnValue(
      Effect.fail(mockError),
    );

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(signUpData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Verify the error is an instance of AuthenticationError
    expect(result.current.error).toBeInstanceOf(AuthenticationError);

    expect(mockToastAlert).toHaveBeenCalledWith(
      'Sign Up Failed',
      'Sign Up Failed', // Falls back to ERROR_MESSAGES.SIGNUP_FAILED
      [],
      {
        type: 'error',
      },
    );
  });

  it('should handle signUp without avatarUrl', async () => {
    const signUpData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    };
    const mockResponse = { user: { id: '1' } };
    (authServiceEffect.signUp as jest.Mock).mockReturnValue(
      Effect.succeed(mockResponse),
    );

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(signUpData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authServiceEffect.signUp).toHaveBeenCalledWith(signUpData);
  });
});
