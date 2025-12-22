import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

// Service
import { authService } from '@/features/auth/services/auth';

// Store
import { secureStorage } from '@/services/storage/secure';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSigningUp: boolean;

  setSigningUp: (isSigningUp: boolean) => void;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isSigningUp: false,

  setSigningUp: isSigningUp => set({ isSigningUp }),

  setUser: user => set({ user, isAuthenticated: !!user }),

  setSession: session =>
    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session?.user,
    }),

  setLoading: isLoading => set({ isLoading }),

  initialize: async () => {
    try {
      set({ isLoading: true });
      const session = await authService.getSession();

      if (session) {
        set({
          session,
          user: session.user,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, session: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      await authService.signOut();
      await secureStorage.clear();
      set({
        user: null,
        session: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  reset: () =>
    set({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    }),
}));
