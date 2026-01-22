import { renderHook } from '@testing-library/react-native';

// Mock dependencies
import { useAuthStore } from '@/features/auth/store/auth';

import { authServiceEffect } from '../../services/auth.effect';
import { useAuth } from '../useAuth';

const mockInitialize = jest.fn();
const mockSetSession = jest.fn();
const mockSetLoading = jest.fn();
const mockSignOut = jest.fn();
const mockUnsubscribe = jest.fn();

const mockUser = { id: '1', email: 'test@example.com' };
const mockSession = { user: mockUser, access_token: 'token' };

jest.mock('@/features/auth/store/auth', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/features/auth/services/auth.effect', () => ({
  authServiceEffect: {
    onAuthStateChange: jest.fn(),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      session: mockSession,
      isLoading: false,
      isAuthenticated: true,
      isSigningUp: false,
      setSession: mockSetSession,
      setLoading: mockSetLoading,
      initialize: mockInitialize,
      signOut: mockSignOut,
    });

    (authServiceEffect.onAuthStateChange as jest.Mock).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mockUnsubscribe,
        },
      },
    });
  });

  describe('Initialization', () => {
    it('should call initialize on mount', () => {
      renderHook(() => useAuth());

      expect(mockInitialize).toHaveBeenCalledTimes(1);
    });

    it('should set up auth state change subscription on mount', () => {
      renderHook(() => useAuth());

      expect(authServiceEffect.onAuthStateChange).toHaveBeenCalledTimes(1);
      expect(authServiceEffect.onAuthStateChange).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should return correct values from store', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.signOut).toBe(mockSignOut);
    });
  });

  describe('Auth State Change', () => {
    it('should call setSession and setLoading when auth state changes and not signing up', () => {
      let authStateChangeCallback: (event: string, session: any) => void;

      (authServiceEffect.onAuthStateChange as jest.Mock).mockImplementation(
        callback => {
          authStateChangeCallback = callback;
          return {
            data: {
              subscription: {
                unsubscribe: mockUnsubscribe,
              },
            },
          };
        },
      );

      renderHook(() => useAuth());

      // Simulate auth state change
      authStateChangeCallback!('SIGNED_IN', mockSession);

      expect(mockSetSession).toHaveBeenCalledWith(mockSession);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    it('should not call setSession or setLoading when isSigningUp is true', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        user: mockUser,
        session: mockSession,
        isLoading: false,
        isAuthenticated: true,
        isSigningUp: true,
        setSession: mockSetSession,
        setLoading: mockSetLoading,
        initialize: mockInitialize,
        signOut: mockSignOut,
      });

      let authStateChangeCallback: (event: string, session: any) => void;

      (authServiceEffect.onAuthStateChange as jest.Mock).mockImplementation(
        callback => {
          authStateChangeCallback = callback;
          return {
            data: {
              subscription: {
                unsubscribe: mockUnsubscribe,
              },
            },
          };
        },
      );

      renderHook(() => useAuth());

      // Simulate auth state change
      authStateChangeCallback!('SIGNED_IN', mockSession);

      expect(mockSetSession).not.toHaveBeenCalled();
      expect(mockSetLoading).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from auth state change on unmount', () => {
      const { unmount } = renderHook(() => useAuth());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('Return Values', () => {
    it('should return user from store', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBe(mockUser);
    });

    it('should return session from store', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.session).toBe(mockSession);
    });

    it('should return isLoading from store', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        user: mockUser,
        session: mockSession,
        isLoading: true,
        isAuthenticated: false,
        isSigningUp: false,
        setSession: mockSetSession,
        setLoading: mockSetLoading,
        initialize: mockInitialize,
        signOut: mockSignOut,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return isAuthenticated from store', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        isSigningUp: false,
        setSession: mockSetSession,
        setLoading: mockSetLoading,
        initialize: mockInitialize,
        signOut: mockSignOut,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return signOut function from store', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.signOut).toBe(mockSignOut);
      expect(typeof result.current.signOut).toBe('function');
    });
  });
});
