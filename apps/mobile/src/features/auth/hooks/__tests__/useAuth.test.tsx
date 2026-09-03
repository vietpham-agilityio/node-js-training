import { renderHook, waitFor } from '@testing-library/react-native';

// Mock dependencies
import { useAuthStore } from '@/features/auth/store/auth';
import { useAuth } from '../useAuth';
import { runEffectForQuery } from '@/utils/effect';

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

jest.mock('@/utils/effect', () => ({
  runEffectForQuery: jest.fn(),
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

    // Mock runEffectForQuery to return the subscription result
    (runEffectForQuery as jest.Mock).mockResolvedValue({
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

    it('should set up auth state change subscription on mount', async () => {
      renderHook(() => useAuth());

      await waitFor(() => {
        expect(runEffectForQuery).toHaveBeenCalledTimes(1);
      });
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

  describe('Cleanup', () => {
    it('should unsubscribe from auth state change on unmount', async () => {
      const { unmount } = renderHook(() => useAuth());

      // Wait for the subscription to be set up
      await waitFor(() => {
        expect(runEffectForQuery).toHaveBeenCalled();
      });

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
