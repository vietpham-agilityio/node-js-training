import { authService } from '@/services/supabase';
import { useAuthStore } from '@/stores';
import { useEffect } from 'react';

export const useAuth = () => {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    setSession,
    setLoading,
    initialize,
    signOut,
  } = useAuthStore();

  useEffect(() => {
    initialize();

    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize, setLoading, setSession]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    signOut,
  };
};
