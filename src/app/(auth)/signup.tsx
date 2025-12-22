// Constants
import { ERROR_MESSAGES } from '@/constants';

// Hooks
import { useSignUp } from '@/features/auth/hooks/useSignUp';
import { useUploadAvatar } from '@/features/setting/hooks/useProfile';
import { useToastAlert } from '@/hooks/useToast';

// Stores
import { useAuthStore } from '@/features/auth/store/auth';

// Types
import { SignUpData } from '@/features/auth/types/auth';

// Components
import { SignUpForm } from '@/features/auth/components/SignUpForm';

// Layout
import { AccessLayout } from '@/layouts/AccessLayout';

const SignupScreen = () => {
  const toast = useToastAlert();

  const { mutateAsync: signUp, isPending: isSigningUp } = useSignUp();
  const { mutateAsync: uploadAvatar, isPending: isUploading } =
    useUploadAvatar();
  const { setSigningUp } = useAuthStore();

  const isLoading = isSigningUp || isUploading;

  const handleSubmit = async (data: SignUpData) => {
    setSigningUp(true);

    const { fullName, password, email, avatarUrl } = data;

    // First, sign up the user with email and password
    const signUpData = await signUp({ email, password, fullName });

    // Then, upload avatar
    if (avatarUrl && signUpData.user) {
      try {
        await uploadAvatar({
          userId: signUpData.user.id,
          file: {
            uri: avatarUrl,
          },
        });
      } catch {
        toast.error(ERROR_MESSAGES.UPDATE_PROFILE_FAILED);
      }
    }

    setSigningUp(false);
  };

  return (
    <AccessLayout mode="signup" loading={isLoading}>
      <SignUpForm isPending={isLoading} onSubmit={handleSubmit} />
    </AccessLayout>
  );
};

export default SignupScreen;
