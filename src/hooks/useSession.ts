import { useMutation, useQuery } from '@tanstack/react-query';

// Constants
import { API_CONFIG } from '@/constants';

// Service
import { authService } from '@/features/auth/services/auth';

// Store
import { useAuthStore } from '@/features/auth/store/auth';

// Types
import { ChangePasswordData } from '@/features/auth/types/auth';

export const useSession = () => {
  return useQuery({
    queryKey: ['session'],
    queryFn: () => authService.getSession(),
    staleTime: API_CONFIG.QUERY_STALE_TIME,
  });
};

export const useRefreshSession = () => {
  return useMutation({
    mutationFn: () => authService.refreshSession(),
  });
};

/**
 * Hook for requesting password reset email
 * Sends reset link to user's email
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      try {
        await authService.resetPassword(email);

        return { success: true };
      } catch (error) {
        console.error('Password reset request failed:', error);
        throw error;
      }
    },
    onError: error => {
      console.error('useResetPassword error:', error);
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
      try {
        await authService.verifyCurrentPassword(
          user.email,
          data.currentPassword,
        );
      } catch (error) {
        console.error('Current password verification failed:', error);
        throw new Error('Current password is incorrect');
      }

      // Step 2: Update to new password
      try {
        await authService.updatePassword(data.newPassword);
        return { success: true };
      } catch (error) {
        console.error('Password update failed:', error);
        throw error;
      }
    },
    onError: error => {
      console.error('useUpdatePassword error:', error);
    },
  });
};
