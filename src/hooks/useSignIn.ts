import { authService } from '@/services/supabase';
import { useAuthStore } from '@/stores';
import { SignInData } from '@/types';
import { useMutation } from '@tanstack/react-query';

export const useSignIn = () => {
  const setSession = useAuthStore(state => state.setSession);

  return useMutation({
    mutationFn: (data: SignInData) => authService.signIn(data),
    onSuccess: data => {
      setSession(data.session);
    },
  });
};

export const useSignInWithGoogle = () => {
  const setSession = useAuthStore(state => state.setSession);

  return useMutation({
    mutationFn: () => authService.signInWithGoogle(),
    onSuccess: data => {
      if (data?.session) {
        setSession(data.session);
      }
    },
  });
};

export const useSignInWithFacebook = () => {
  const setSession = useAuthStore(state => state.setSession);

  return useMutation({
    mutationFn: () => authService.signInWithFacebook(),
    onSuccess: data => {
      if (data?.session) {
        setSession(data.session);
      }
    },
  });
};
