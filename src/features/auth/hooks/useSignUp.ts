// Services
import { ERROR_MESSAGES, MESSAGES, ToastType } from '@/constants';
import { authService } from '@/features/auth/services/auth';

// Types
import { SignUpData } from '@/features/auth/types/auth';

// Hooks
import { useToastAlert } from '@/hooks/useToast';

// React Query
import { useMutation } from '@tanstack/react-query';

export const useSignUp = () => {
  const toast = useToastAlert();

  return useMutation({
    mutationFn: async (data: SignUpData) => {
      return await authService.signUp(data);
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
