import { Effect } from 'effect';
import { useMutation, useQuery } from '@tanstack/react-query';

// Constants
import { API_CONFIG } from '@/constants';

// Store
import { useAuthStore } from '@/features/auth/store/auth';

// Types
import { ChangePasswordData } from '@/features/auth/types/auth';

// Utils
import { runEffectForQuery } from '@/utils/effect';

// Effect Services
import { AuthService } from '@/features/auth/effect/services';
import { AuthServiceLayer } from '@/features/auth/layer';

export const useSession = () => {
  return useQuery({
    queryKey: ['session'],
    queryFn: () =>
      runEffectForQuery(
        Effect.gen(function* () {
          const authService = yield* AuthService;
          return yield* authService.getSession();
        }),
        AuthServiceLayer,
      ),
    staleTime: API_CONFIG.QUERY_STALE_TIME,
  });
};

export const useRefreshSession = () => {
  return useMutation({
    mutationFn: () =>
      runEffectForQuery(
        Effect.gen(function* () {
          const authService = yield* AuthService;
          return yield* authService.refreshSession();
        }),
        AuthServiceLayer,
      ),
  });
};

/**
 * Hook for requesting password reset email
 * Sends reset link to user's email
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      await runEffectForQuery(
        Effect.gen(function* () {
          const authService = yield* AuthService;
          return yield* authService.resetPassword(email);
        }),
        AuthServiceLayer,
      );
      return { success: true };
    },
  });
};

/**
 * Hook for updating user password with current password verification
 * Verifies current password before allowing update
 */
export const useUpdatePassword = () => {
  const user = useAuthStore(state => state.user);

  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      if (!user?.email) {
        throw new Error('No authenticated user found');
      }

      // Step 1: Verify current password
      await runEffectForQuery(
        Effect.gen(function* () {
          const authService = yield* AuthService;
          return yield* authService.verifyCurrentPassword(
            user.email!,
            data.currentPassword,
          );
        }),
        AuthServiceLayer,
      );

      // Step 2: Update to new password
      await runEffectForQuery(
        Effect.gen(function* () {
          const authService = yield* AuthService;
          return yield* authService.updatePassword(data.newPassword);
        }),
        AuthServiceLayer,
      );
      return { success: true };
    },
  });
};
