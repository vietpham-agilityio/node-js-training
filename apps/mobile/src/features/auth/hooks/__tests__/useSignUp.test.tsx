import { AuthenticationError } from '@/features/auth/error/auth';
import { authServiceEffect } from '@/features/auth/services/auth.effect';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { Effect } from 'effect';
import React from 'react';
import { useSignUp } from '../useSignUp';

// Mock dependencies
const mockToastAlert = jest.fn();
const mockSetSession = jest.fn();

jest.mock('@/features/auth/store/auth', () => ({
  useAuthStore: (selector: any) =>
    selector
      ? selector({ setSession: mockSetSession })
      : { setSession: mockSetSession },
}));

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

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';

  return Wrapper;
};

const signUpData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'Password123!',
};

const mockResponse = {
  user: { id: '1', email: 'john@example.com', role: 'user' },
  session: { user: { id: '1' }, accessToken: 'token' },
};

describe('useSignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call authServiceEffect.signUp with correct data', async () => {
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

  it('sets the session and shows a success toast on success', async () => {
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

    expect(mockSetSession).toHaveBeenCalledWith(mockResponse.session);
    expect(mockToastAlert).toHaveBeenCalledWith(
      'Sign up successful',
      'Your account is ready. Enjoy the movies!',
      [],
      { type: 'success' },
    );
  });

  it('shows an error toast with the error message when signUp fails', async () => {
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
      { type: 'error' },
    );
  });

  it('shows an error toast with an AuthenticationError message', async () => {
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

    expect(result.current.error).toBeInstanceOf(AuthenticationError);
    expect(mockToastAlert).toHaveBeenCalledWith(
      'Sign Up Failed',
      'Email already registered',
      [],
      { type: 'error' },
    );
  });

  it('falls back to the default message when the error message is empty', async () => {
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

    expect(mockToastAlert).toHaveBeenCalledWith(
      'Sign Up Failed',
      'Sign Up Failed',
      [],
      { type: 'error' },
    );
  });
});
