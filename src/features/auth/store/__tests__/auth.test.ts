import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useAuthStore } from '../auth';

// Mock dependencies
const mockGetSession = jest.fn();
const mockSignOut = jest.fn();
const mockClear = jest.fn();

jest.mock('@/features/auth/services/auth', () => ({
  authService: {
    getSession: mockGetSession,
    signOut: mockSignOut,
  },
}));

jest.mock('@/services/storage/secure', () => ({
  secureStorage: {
    clear: mockClear,
  },
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to initial state
    useAuthStore.getState().reset();
  });

  describe('setSigningUp', () => {
    it('should update isSigningUp state', () => {
      act(() => {
        useAuthStore.getState().setSigningUp(true);
      });

      expect(useAuthStore.getState().isSigningUp).toBe(true);

      act(() => {
        useAuthStore.getState().setSigningUp(false);
      });

      expect(useAuthStore.getState().isSigningUp).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should update user and isAuthenticated state', () => {
      const mockUser = { id: '1', email: 'test@example.com' } as any;

      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set isAuthenticated to false when user is null', () => {
      act(() => {
        useAuthStore.getState().setUser(null);
      });

      const state = useAuthStore.getState();
      expect(state.user).toBe(null);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setSession', () => {
    it('should update session, user, and isAuthenticated state', () => {
      const mockUser = { id: '1', email: 'test@example.com' } as any;
      const mockSession = {
        user: mockUser,
        access_token: 'token',
      } as any;

      act(() => {
        useAuthStore.getState().setSession(mockSession);
      });

      const state = useAuthStore.getState();
      expect(state.session).toEqual(mockSession);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set user and isAuthenticated to false when session is null', () => {
      act(() => {
        useAuthStore.getState().setSession(null);
      });

      const state = useAuthStore.getState();
      expect(state.session).toBe(null);
      expect(state.user).toBe(null);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should update isLoading state', () => {
      act(() => {
        useAuthStore.getState().setLoading(false);
      });

      expect(useAuthStore.getState().isLoading).toBe(false);

      act(() => {
        useAuthStore.getState().setLoading(true);
      });

      expect(useAuthStore.getState().isLoading).toBe(true);
    });
  });

  describe('initialize', () => {
    it('should set loading to false even when session is null', async () => {
      mockGetSession.mockResolvedValue(null);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).toBe(null);
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      // Set some state first
      act(() => {
        useAuthStore.getState().setUser({ id: '1' } as any);
        useAuthStore.getState().setSession({ access_token: 'token' } as any);
        useAuthStore.getState().setLoading(false);
      });

      // Reset
      act(() => {
        useAuthStore.getState().reset();
      });

      const state = useAuthStore.getState();
      expect(state.user).toBe(null);
      expect(state.session).toBe(null);
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
