import { authService } from '@/services/supabase';
import { SignUpData } from '@/types';
import { useMutation } from '@tanstack/react-query';

export const useSignUp = () => {
  return useMutation({
    mutationFn: (data: SignUpData) => authService.signUp(data),
  });
};
