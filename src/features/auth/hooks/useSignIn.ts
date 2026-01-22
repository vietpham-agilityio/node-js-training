// Effect
import { authServiceEffect } from '@/features/auth/services/auth.effect';
import { Cause, Chunk, Effect, Exit, pipe } from 'effect';

// Services
import { MESSAGES } from '@/constants';

// Stores
import { useAuthStore } from '@/features/auth/store/auth';

// Types
import { SignInData } from '@/features/auth/types/auth';

// Hooks
import { useToastAlert } from '@/hooks/useToast';

// Utils
import { logAuthError } from '@/utils/extract';

// React Query
import { useMutation } from '@tanstack/react-query';

export const useSignIn = () => {
  const setSession = useAuthStore(state => state.setSession);
  const toast = useToastAlert();

  return useMutation({
    mutationFn: async (data: SignInData) => {
      const signInProgram = pipe(
        authServiceEffect.signIn(data),
        Effect.tapError(logAuthError), // Log errors in dev mode when fails
      );

      const exit = await Effect.runPromiseExit(signInProgram);

      return Exit.match(exit, {
        onSuccess: value => value,
        onFailure: cause => {
          // Extract the actual error from the cause and rethrow it
          const failures = Cause.failures(cause);
          if (Chunk.size(failures) > 0) {
            throw Chunk.unsafeGet(failures, 0);
          }
          throw new Error('Unknown error occurred');
        },
      });
    },
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
    mutationFn: async () => {
      const signInWithGoogleProgram = pipe(
        authServiceEffect.signInWithGoogle(),
        Effect.tapError(logAuthError), // Log errors in dev mode when fails
      );

      const exit = await Effect.runPromiseExit(signInWithGoogleProgram);

      return Exit.match(exit, {
        onSuccess: value => value,
        onFailure: cause => {
          // Extract the actual error from the cause and rethrow it
          const failures = Cause.failures(cause);
          if (Chunk.size(failures) > 0) {
            throw Chunk.unsafeGet(failures, 0);
          }
          throw new Error('Unknown error occurred');
        },
      });
    },
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
    mutationFn: async () => {
      const signInWithFacebookProgram = pipe(
        authServiceEffect.signInWithFacebook(),
        Effect.tapError(logAuthError), // Log errors in dev mode when fails
      );

      const exit = await Effect.runPromiseExit(signInWithFacebookProgram);

      return Exit.match(exit, {
        onSuccess: value => value,
        onFailure: cause => {
          // Extract the actual error from the cause and rethrow it
          const failures = Cause.failures(cause);
          if (Chunk.size(failures) > 0) {
            throw Chunk.unsafeGet(failures, 0);
          }
          throw new Error('Unknown error occurred');
        },
      });
    },
    onSuccess: data => {
      if (data?.session) {
        toast.success(MESSAGES.SIGNIN_SUCCESS);
        setSession(data.session);
      }
    },
  });
};
