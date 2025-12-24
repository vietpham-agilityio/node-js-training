import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useSignUp } from '../useSignUp';

// Mock dependencies
const mockSignUp = jest.fn();
const mockToastAlert = jest.fn();

jest.mock('@/features/auth/services/auth', () => ({
  authService: {
    signUp: (data: any) => mockSignUp(data),
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

  it('should call authService.signUp with correct data', async () => {
    const signUpData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      avatarUrl: 'https://example.com/avatar.jpg',
    };
    mockSignUp.mockResolvedValue({ user: { id: '1' } });

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(signUpData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSignUp).toHaveBeenCalledWith(signUpData);
    expect(mockSignUp).toHaveBeenCalledTimes(1);
  });

  it('should show success toast on success', async () => {
    const signUpData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    };
    mockSignUp.mockResolvedValue({ user: { id: '1' } });

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
    mockSignUp.mockRejectedValue(mockError);

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

  it('should show error toast with default message when signUp fails with non-Error', async () => {
    const signUpData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    };
    const mockError = { message: 'Unknown error', code: 'UNKNOWN' };
    mockSignUp.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(signUpData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockToastAlert).toHaveBeenCalledWith(
      'Sign Up Failed',
      'Failed to create account',
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
    mockSignUp.mockResolvedValue({ user: { id: '1' } });

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(signUpData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSignUp).toHaveBeenCalledWith(signUpData);
  });
});
