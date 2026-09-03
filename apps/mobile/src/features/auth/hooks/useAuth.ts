import { useEffect } from 'react';

// Stores
import { useAuthStore } from '@/features/auth/store/auth';

export const useAuth = () => {
  const { user, session, isLoading, isAuthenticated, initialize, signOut } =
    useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    signOut,
  };
};
