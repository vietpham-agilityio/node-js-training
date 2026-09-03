// Effect
import { Effect } from 'effect';

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

// Effect Services
import { AuthService } from '@/features/auth/effect/services';
import { AuthServiceLayer } from '@/features/auth/layer';

export const useSignIn = () => {
  const setSession = useAuthStore(state => state.setSession);
  const toast = useToastAlert();

  return useMutation({
    mutationFn: async (data: SignInData) => {
      const result = await runEffectForQuery(
        Effect.gen(function* () {
          const authService = yield* AuthService;
          return yield* authService.signIn(data);
        }),
        AuthServiceLayer,
      );
      return result;
    },
    onSuccess: data => {
      toast.success(MESSAGES.SIGNIN_SUCCESS);
      setSession(data.session);
    },
  });
};
