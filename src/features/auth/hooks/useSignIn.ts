// Effect
import { authServiceEffect } from '@/features/auth/services/auth.effect';

// Services
import { MESSAGES } from '@/constants';

// Stores
import { useAuthStore } from '@/features/auth/store/auth';

// Types
import { SignInData } from '@/features/auth/types/auth';

// Hooks
import { useToastAlert } from '@/hooks/useToast';

// Utils
import { runEffectForQuery } from '@/utils/effect';

// React Query
import { useMutation } from '@tanstack/react-query';

export const useSignIn = () => {
  const setSession = useAuthStore(state => state.setSession);
  const toast = useToastAlert();

  return useMutation({
    mutationFn: async (data: SignInData) =>
      runEffectForQuery(authServiceEffect.signIn(data)),
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
    mutationFn: async () =>
      runEffectForQuery(authServiceEffect.signInWithGoogle()),
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
    mutationFn: async () =>
      runEffectForQuery(authServiceEffect.signInWithFacebook()),
    onSuccess: data => {
      if (data?.session) {
        toast.success(MESSAGES.SIGNIN_SUCCESS);
        setSession(data.session);
      }
    },
  });
};
