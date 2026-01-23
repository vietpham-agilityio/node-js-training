import { Effect } from 'effect';
import { useMutation, useQuery } from '@tanstack/react-query';

// Constants
import { API_CONFIG } from '@/constants';

// Service
import { authServiceEffect } from '@/features/auth/services/auth.effect';

// Store
import { useAuthStore } from '@/features/auth/store/auth';

// Types
import { ChangePasswordData } from '@/features/auth/types/auth';

export const useSession = () => {
  return useQuery({
    queryKey: ['session'],
    queryFn: () => Effect.runPromise(authServiceEffect.getSession()),
    staleTime: API_CONFIG.QUERY_STALE_TIME,
  });
};

export const useRefreshSession = () => {
  return useMutation({
    mutationFn: () => Effect.runPromise(authServiceEffect.refreshSession()),
  });
};

/**
 * Hook for requesting password reset email
 * Sends reset link to user's email
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      await Effect.runPromise(authServiceEffect.resetPassword(email));
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
      await Effect.runPromise(
        authServiceEffect.verifyCurrentPassword(
          user.email,
          data.currentPassword,
        ),
      );

      // Step 2: Update to new password
      await Effect.runPromise(
        authServiceEffect.updatePassword(data.newPassword),
      );
      return { success: true };
    },
  });
};
