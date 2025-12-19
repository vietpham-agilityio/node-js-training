import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

// Constants
import { ERROR_MESSAGES, MESSAGES, ROUTES } from '@/constants';

// Hooks
import { useSignUp } from '@/features/auth/hooks/useSignUp';
import { useUploadAvatar } from '@/features/setting/hooks/useProfile';

// Types
import { SignUpData } from '@/features/auth/types/auth';

// Components
import { SignUpForm } from '@/features/auth/components/SignUpForm';

// Layout
import { AccessLayout } from '@/layouts/AcessLayout';

const SignupScreen = () => {
  const router = useRouter();
  const { mutate: signUp, isPending: isSigningUp } = useSignUp();
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();

  const isLoading = isSigningUp || isUploading;

  const handleSubmit = async (data: SignUpData) => {
    try {
      const { fullName, password, email, avatarUrl } = data;
      // First, sign up the user with email and password
      await new Promise<void>((resolve, reject) => {
        signUp(
          {
            fullName,
            email,
            password,
          },
          {
            onSuccess: () => resolve(),
            onError: error => reject(error),
          },
        );
      });

      // Then, upload avatar
      if (avatarUrl) {
        await new Promise<void>((resolve, reject) => {
          uploadAvatar(
            { uri: avatarUrl },
            {
              onSuccess: () => resolve(),
              onError: error => reject(error),
            },
          );
        });
      }

      Alert.alert(
        MESSAGES.SIGNUP_SUCCESS,
        MESSAGES.ACCOUNT_VERIFICATION_SUCCESS,
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace(ROUTES.WELCOME);
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        ERROR_MESSAGES.SIGNUP_FAILED,
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.CREATE_ACCOUNT_FAILED,
      );
    }
  };

  return (
    <AccessLayout mode="signup" loading={isLoading}>
      <SignUpForm isPending={isLoading} onSubmit={handleSubmit} />
    </AccessLayout>
  );
};

export default SignupScreen;
