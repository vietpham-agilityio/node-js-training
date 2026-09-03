// Effect
import { Effect } from 'effect';

// Services
import { ERROR_MESSAGES, MESSAGES, ToastType } from '@/constants';

// Stores
import { useAuthStore } from '@/features/auth/store/auth';

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
  const setSession = useAuthStore(state => state.setSession);
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
    onSuccess: data => {
      // register issues a token pair — the user is signed in already.
      setSession(data.session);
      toast.alert(MESSAGES.SIGNUP_SUCCESS, MESSAGES.ACCOUNT_CREATED, [], {
        type: ToastType.SUCCESS,
      });
    },
    onError: error => {
      const message =
        error instanceof Error && error.message
          ? error.message
          : ERROR_MESSAGES.SIGNUP_FAILED;
      toast.alert(ERROR_MESSAGES.SIGNUP_FAILED, message, [], {
        type: ToastType.ERROR,
      });
    },
  });
};
