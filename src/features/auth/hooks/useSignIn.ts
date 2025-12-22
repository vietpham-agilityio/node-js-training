// Services
import { MESSAGES } from '@/constants';
import { authService } from '@/features/auth/services/auth';

// Stores
import { useAuthStore } from '@/features/auth/store/auth';

// Types
import { SignInData } from '@/features/auth/types/auth';

// Hooks
import { useToastAlert } from '@/hooks/useToast';

// React Query
import { useMutation } from '@tanstack/react-query';

export const useSignIn = () => {
  const setSession = useAuthStore(state => state.setSession);
  const toast = useToastAlert();

  return useMutation({
    mutationFn: (data: SignInData) => authService.signIn(data),
    onSuccess: data => {
      toast.success(MESSAGES.SIGNIN_SUCCESS);
      setSession(data.session);
    },
  });
};

export const useSignInWithGoogle = () => {
  const setSession = useAuthStore(state => state.setSession);
  const toast = useToastAlert();

  return useMutation({
    mutationFn: () => authService.signInWithGoogle(),
    onSuccess: data => {
      if (data?.session) {
        toast.success(MESSAGES.SIGNIN_SUCCESS);
        setSession(data.session);
      }
    },
  });
};

export const useSignInWithFacebook = () => {
  const setSession = useAuthStore(state => state.setSession);
  const toast = useToastAlert();

  return useMutation({
    mutationFn: () => authService.signInWithFacebook(),
    onSuccess: data => {
      if (data?.session) {
        toast.success(MESSAGES.SIGNIN_SUCCESS);
        setSession(data.session);
      }
    },
  });
};
