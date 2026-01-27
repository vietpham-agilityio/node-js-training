import { useEffect } from 'react';

// Effect
import { Effect } from 'effect';

// Stores
import { useAuthStore } from '@/features/auth/store/auth';

// Utils
import { runEffectForQuery } from '@/utils/effect';

// Effect Services
import { AuthService } from '@/features/auth/effect/services';
import { AuthServiceLayer } from '@/features/auth/layer';

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

    let subscription: { unsubscribe: () => void } | null = null;

    // Use AuthService with Layer for onAuthStateChange
    runEffectForQuery(
      Effect.gen(function* () {
        const authService = yield* AuthService;
        const result = yield* authService.onAuthStateChange(
          (_event, session) => {
            if (!isSigningUp) {
              setSession(session);
              setLoading(false);
            }
          },
        );
        return result;
      }),
      AuthServiceLayer,
    )
      .then(result => {
        // onAuthStateChange returns { data: { subscription } } from supabase
        subscription = result.data.subscription;
      })
      .catch(() => {
        // Handle error silently for subscription setup
      });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
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
