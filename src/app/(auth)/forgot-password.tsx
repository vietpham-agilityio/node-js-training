import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

// Constants
import { ROUTES } from '@/constants';

// Hooks
import { useResetPassword } from '@/hooks';

// Components
import { Input, Typo } from '@/components/common';
import { AccessLayout } from '@/components/layouts';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const { mutate: resetPassword, isPending } = useResetPassword();

  const handleSubmit = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    resetPassword(email, {
      onSuccess: () => {
        Alert.alert(
          'Success',
          'Password reset link has been sent to your email.',
          [{ text: 'OK', onPress: () => router.replace(ROUTES.LOGIN) }],
        );
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message || 'Failed to send reset link');
      },
    });
  };

  return (
    <AccessLayout mode="signin" loading={isPending}>
      <View className="gap-1 mt-8 mb-[30]">
        <Typo size="2xl" weight="medium" accessibilityRole="header">
          Forgot Password?
        </Typo>
      </View>

      <View className="gap-4">
        <Typo size="sm" className="text-text-secondary mb-2">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </Typo>

        <View>
          <Input
            accessibilityRole="text"
            accessibilityLabel="Email address input field"
            accessibilityHint="Enter the email address associated with your account"
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            autoComplete="email"
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={isPending}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Send password reset link"
          accessibilityHint="Sends an email with password reset instructions"
          className="bg-primary rounded-xl p-4 items-center mt-4"
        >
          <Typo weight="medium" className="text-white">
            {isPending ? 'Sending...' : 'Send Reset Link'}
          </Typo>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Back to login"
          accessibilityHint="Navigate back to the Login screen"
          className="items-center mt-4"
        >
          <Typo size="sm" className="text-primary">
            Back to Login
          </Typo>
        </Pressable>
      </View>
    </AccessLayout>
  );
};

export default ForgotPasswordScreen;
