import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

// Constants
import { ROUTES } from '@/constants';

// Components
import { Button } from '@/components/Button';
import { Typo } from '@/components/Typo';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

const StyledSafeAreaView = withUniwind(SafeAreaView);
const StyledScrollView = withUniwind(ScrollView);

const ResetPasswordScreen = () => {
  const params = useLocalSearchParams();

  // Check if we have a valid recovery session
  if (params.type !== 'recovery') {
    return (
      <StyledSafeAreaView edges={['bottom']} className="flex-1 bg-bg-primary">
        <View className="flex-1 items-center px-6">
          <Typo
            size="2xl"
            weight="semibold"
            className="text-text-primary text-center mb-4"
            testID="reset-password-invalid-link-title"
          >
            Invalid or expired reset link
          </Typo>
          <Typo
            size="base"
            weight="semibold"
            className="text-text-secondary text-center mb-6"
            testID="reset-password-invalid-link-description"
          >
            This password reset link is invalid or has expired. Please request a
            new one.
          </Typo>
          <Button
            title="Request New Link"
            onPress={() => router.replace(ROUTES.FORGOT_PASSWORD)}
            testID="request-new-link-button"
          />
        </View>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView
      edges={['bottom']}
      className="flex-1 bg-bg-primary"
      accessibilityLabel="Reset Password screen"
      testID="reset-password-screen"
    >
      <StyledScrollView
        contentContainerClassName="flex-1 px-6 pb-16"
        showsVerticalScrollIndicator={false}
        testID="reset-password-scroll-view"
      >
        <ResetPasswordForm />
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default ResetPasswordScreen;
