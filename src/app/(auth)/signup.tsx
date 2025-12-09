import { useRouter } from 'expo-router';
import { Alert, ScrollView } from 'react-native';

// Constants
import { ERROR_MESSAGES, MESSAGES, ROUTES } from '@/constants';

// Hooks
import { useSignUp } from '@/hooks';

// Types
import { SignUpData } from '@/types';

// Components
import { SignUpForm } from '@/components/feature';
import { AccessLayout } from '@/components/layouts';

const SignupScreen = () => {
  const router = useRouter();
  const { mutate: signUp, isPending: isSigningUp } = useSignUp();

  const handleSubmit = (data: SignUpData) => {
    signUp(data, {
      onSuccess: () => {
        Alert.alert(
          MESSAGES.SIGNUP_SUCCESS,
          MESSAGES.ACCOUNT_VERIFICATION_SUCCESS,
          [
            {
              text: 'OK',
            },
          ],
        );

        // Navigate to confirmation screen
        router.push({
          pathname: ROUTES.CONFIRM_ACCOUNT,
          params: {
            fullName: data?.fullName,
            avatarUrl: data?.avatarUrl,
          },
        });
      },
      onError: (error: Error) => {
        Alert.alert(
          ERROR_MESSAGES.SIGNUP_FAILED,
          error.message || ERROR_MESSAGES.CREATE_ACCOUNT_FAILED,
        );
      },
    });
  };

  return (
    <AccessLayout mode="signup">
      <ScrollView contentContainerClassName="items-center mt-24 pb-80">
        <SignUpForm isPending={isSigningUp} onSubmit={handleSubmit} />
      </ScrollView>
    </AccessLayout>
  );
};

export default SignupScreen;
