// Effect
import { Effect } from 'effect';

// Services
import { ERROR_MESSAGES, MESSAGES, ToastType } from '@/constants';

// Types
import { SignUpData } from '@/features/auth/types/auth';

// Hooks
import { useToastAlert } from '@/hooks/useToast';

// Utils
import { runEffectForQuery } from '@/utils/effect';

// React Query
import { useMutation } from '@tanstack/react-query';

// Effect Services
import { AuthService } from '@/features/auth/effect/services';
import { AuthServiceLayer } from '@/features/auth/layer';

export const useSignUp = () => {
  const toast = useToastAlert();

  return useMutation({
    mutationFn: async (data: SignUpData) => {
      const result = await runEffectForQuery(
        Effect.gen(function* () {
          const authService = yield* AuthService;
          return yield* authService.signUp(data);
        }),
        AuthServiceLayer,
      );
      return result;
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
