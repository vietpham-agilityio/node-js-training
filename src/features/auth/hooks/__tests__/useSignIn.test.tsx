import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import {
  useSignIn,
  useSignInWithFacebook,
  useSignInWithGoogle,
} from '../useSignIn';

// Mock dependencies
const mockSetSession = jest.fn();
const mockSignIn = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockSignInWithFacebook = jest.fn();
const mockToastSuccess = jest.fn();

jest.mock('@/features/auth/store/auth', () => ({
  useAuthStore: (selector: any) => {
    if (selector) {
      return selector({ setSession: mockSetSession });
    }
    return { setSession: mockSetSession };
  },
}));

jest.mock('@/features/auth/services/auth', () => ({
  authService: {
    signIn: (data: any) => mockSignIn(data),
    signInWithGoogle: () => mockSignInWithGoogle(),
    signInWithFacebook: () => mockSignInWithFacebook(),
  },
}));

jest.mock('@/hooks/useToast', () => ({
  useToastAlert: () => ({
    success: mockToastSuccess,
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

describe('useSignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call authService.signIn with correct data', async () => {
    const mockSession = { user: { id: '1' }, access_token: 'token' };
    const signInData = { email: 'test@example.com', password: 'password123' };
    mockSignIn.mockResolvedValue({ session: mockSession });

    const { result } = renderHook(() => useSignIn(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(signInData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSignIn).toHaveBeenCalledWith(signInData);
    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it('should call setSession and show success toast on success', async () => {
    const mockSession = { user: { id: '1' }, access_token: 'token' };
    const signInData = { email: 'test@example.com', password: 'password123' };
    mockSignIn.mockResolvedValue({ session: mockSession });

    const { result } = renderHook(() => useSignIn(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(signInData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSetSession).toHaveBeenCalledWith(mockSession);
    expect(mockToastSuccess).toHaveBeenCalledWith('Successfully signed in!');
  });

  it('should handle error when signIn fails', async () => {
    const mockError = new Error('Sign in failed');
    const signInData = { email: 'test@example.com', password: 'password123' };
    mockSignIn.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSignIn(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(signInData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
    expect(mockSetSession).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });
});

describe('useSignInWithGoogle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call authService.signInWithGoogle', async () => {
    const mockSession = { user: { id: '1' }, access_token: 'token' };
    mockSignInWithGoogle.mockResolvedValue({ session: mockSession });

    const { result } = renderHook(() => useSignInWithGoogle(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('should call setSession and show success toast when session exists', async () => {
    const mockSession = { user: { id: '1' }, access_token: 'token' };
    mockSignInWithGoogle.mockResolvedValue({ session: mockSession });

    const { result } = renderHook(() => useSignInWithGoogle(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSetSession).toHaveBeenCalledWith(mockSession);
    expect(mockToastSuccess).toHaveBeenCalledWith('Successfully signed in!');
  });

  it('should not call setSession or show toast when session does not exist', async () => {
    mockSignInWithGoogle.mockResolvedValue({ session: null });

    const { result } = renderHook(() => useSignInWithGoogle(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSetSession).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should handle error when signInWithGoogle fails', async () => {
    const mockError = new Error('Google sign in failed');
    mockSignInWithGoogle.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSignInWithGoogle(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});

describe('useSignInWithFacebook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call authService.signInWithFacebook', async () => {
    const mockSession = { user: { id: '1' }, access_token: 'token' };
    mockSignInWithFacebook.mockResolvedValue({ session: mockSession });

    const { result } = renderHook(() => useSignInWithFacebook(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSignInWithFacebook).toHaveBeenCalledTimes(1);
  });

  it('should call setSession and show success toast when session exists', async () => {
    const mockSession = { user: { id: '1' }, access_token: 'token' };
    mockSignInWithFacebook.mockResolvedValue({ session: mockSession });

    const { result } = renderHook(() => useSignInWithFacebook(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSetSession).toHaveBeenCalledWith(mockSession);
    expect(mockToastSuccess).toHaveBeenCalledWith('Successfully signed in!');
  });

  it('should not call setSession or show toast when session does not exist', async () => {
    mockSignInWithFacebook.mockResolvedValue({ session: null });

    const { result } = renderHook(() => useSignInWithFacebook(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSetSession).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should handle error when signInWithFacebook fails', async () => {
    const mockError = new Error('Facebook sign in failed');
    mockSignInWithFacebook.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSignInWithFacebook(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});
