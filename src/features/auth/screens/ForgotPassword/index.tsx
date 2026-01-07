import { valibotResolver } from '@hookform/resolvers/valibot';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

// Constants
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
  ROUTES,
  ToastType,
} from '@/constants';

// Hooks
import { useResetPassword } from '@/hooks/useSession';
import { useToastAlert } from '@/hooks/useToast';

// Components
import { Input } from '@/components/Input';
import { Typo } from '@/components/Typo';

// Layout
import { Button } from '@/components/Button';
import { AccessLayout } from '@/layouts/AccessLayout';

const ForgotPasswordScreen = () => {
  const toast = useToastAlert();
  const router = useRouter();
  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ForgotPasswordFormData>({
    resolver: valibotResolver(forgotPasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      email: '',
    },
  });

  const isDisabled = isSubmitting || isPending || !isDirty;

  const handleSubmitForm = useCallback(
    (data: ForgotPasswordFormData) => {
      resetPassword(data.email, {
        onSuccess: () => {
          toast.withAction(
            'Password reset link has been sent to your email.',
            {
              label: 'OK',
              onPress: () => router.replace(ROUTES.LOGIN),
            },
            ToastType.SUCCESS,
          );
        },
        onError: () => {
          toast.error('Failed to send reset link');
        },
      });
    },
    [resetPassword, router, toast],
  );

  const handleBackToLogin = useCallback(() => {
    router.replace(ROUTES.LOGIN);
  }, [router]);

  return (
    <AccessLayout mode="signup" loading={isPending}>
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

        <View className={errors.email ? 'mb-0' : 'mb-5'}>
          <Controller
            control={control}
            name="email"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                accessibilityRole="text"
                accessibilityLabel="Email address input field"
                accessibilityHint="Enter the email address associated with your account"
                label="Email Address"
                value={value}
                error={error?.message}
                testID="signup-email-input"
                keyboardType="email-address"
                returnKeyType="next"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </View>

        <Button
          accessible
          accessibilityRole="button"
          accessibilityLabel="Send password reset link"
          accessibilityHint="Sends an email with password reset instructions"
          disabled={isDisabled}
          title={isPending ? 'Sending...' : 'Send Reset Link'}
          onPress={handleSubmit(handleSubmitForm)}
        />

        <Button
          accessible
          accessibilityRole="button"
          accessibilityLabel="Back to login"
          accessibilityHint="Navigate back to the Login screen"
          title="Back to Login"
          isPrimary={false}
          onPress={handleBackToLogin}
        />
      </View>
    </AccessLayout>
  );
};

export default ForgotPasswordScreen;
