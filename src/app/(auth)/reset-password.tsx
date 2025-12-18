import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

// Components
import { Button } from '@/components/common';
import { ResetPasswordForm } from '@/components/feature';

// Constants
import { ROUTES } from '@/constants';

const StyledSafeAreaView = withUniwind(SafeAreaView);
const StyledScrollView = withUniwind(ScrollView);
const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

const ResetPasswordScreen = () => {
  const params = useLocalSearchParams();

  // Check if we have a valid recovery session
  if (params.type !== 'recovery') {
    return (
      <StyledSafeAreaView edges={['bottom']} className="flex-1 bg-bg-primary">
        <StyledView className="flex-1 items-center px-6">
          <StyledText className="text-text-primary text-lg text-center mb-4">
            Invalid or expired reset link
          </StyledText>
          <StyledText className="text-text-secondary text-base text-center mb-6">
            This password reset link is invalid or has expired. Please request a
            new one.
          </StyledText>
          <Button
            title="Request New Link"
            onPress={() => router.replace(ROUTES.FORGOT_PASSWORD)}
          />
        </StyledView>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView
      edges={['bottom']}
      className="flex-1 bg-bg-primary"
      accessibilityLabel="Reset Password screen"
    >
      <StyledScrollView
        contentContainerClassName="flex-1 px-6 pb-16"
        showsVerticalScrollIndicator={false}
      >
        <ResetPasswordForm />
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default ResetPasswordScreen;
