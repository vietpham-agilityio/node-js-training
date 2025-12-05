import { authService } from '@/services/supabase';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSession = () => {
  return useQuery({
    queryKey: ['session'],
    queryFn: () => authService.getSession(),
    staleTime: 5 * 60 * 1000,
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
