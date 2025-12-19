// Services
import { authService } from '@/features/auth/services/auth';

// Types
import { SignUpData } from '@/features/auth/types/auth';

// React Query
import { useMutation } from '@tanstack/react-query';

export const useSignUp = () => {
  return useMutation({
    mutationFn: (data: SignUpData) => authService.signUp(data),
  });
};
