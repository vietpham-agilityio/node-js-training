import { Cause, Chunk, Effect, Exit, pipe } from 'effect';

// Services
import { ERROR_MESSAGES, MESSAGES, ToastType } from '@/constants';

// Effect
import { authServiceEffect } from '@/features/auth/services/auth.effect';

// Types
import { SignUpData } from '@/features/auth/types/auth';

// Hooks
import { useToastAlert } from '@/hooks/useToast';

// Utils
import { logAuthError } from '@/utils/extract';

// React Query
import { useMutation } from '@tanstack/react-query';

export const useSignUp = () => {
  const toast = useToastAlert();

  return useMutation({
    mutationFn: async (data: SignUpData) => {
      const signUpProgram = pipe(
        authServiceEffect.signUp(data),
        Effect.tapError(logAuthError), // Log errors in dev mode when fails
      );

      const exit = await Effect.runPromiseExit(signUpProgram);

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
    onSuccess: () => {
      toast.alert(
        MESSAGES.SIGNUP_SUCCESS,
        MESSAGES.ACCOUNT_VERIFICATION_SUCCESS,
        [],
        {
          type: ToastType.SUCCESS,
        },
      );
    },
    onError: error => {
      toast.alert(
        ERROR_MESSAGES.SIGNUP_FAILED,
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.CREATE_ACCOUNT_FAILED,
        [],
        {
          type: ToastType.ERROR,
        },
      );
    },
  });
};
