import { useEffect } from 'react';

// Effect
import { authServiceEffect } from '@/features/auth/services/auth.effect';

// Stores
import { useAuthStore } from '@/features/auth/store/auth';

export const useAuth = () => {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    isSigningUp,
    setSession,
    setLoading,
    initialize,
    signOut,
  } = useAuthStore();

  useEffect(() => {
    initialize();

    const {
      data: { subscription },
    } = authServiceEffect.onAuthStateChange((_event, session) => {
      if (!isSigningUp) {
        setSession(session);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize, isSigningUp, setLoading, setSession]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    signOut,
  };
};
