import { API_CONFIG } from '@/constants';
import { authService } from '@/services/supabase';
import { useMutation, useQuery } from '@tanstack/react-query';

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

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.resetPassword(email),
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (newPassword: string) =>
      authService.updatePassword(newPassword),
  });
};
