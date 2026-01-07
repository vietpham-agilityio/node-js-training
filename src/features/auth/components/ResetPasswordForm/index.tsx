import { valibotResolver } from '@hookform/resolvers/valibot';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextInput, View } from 'react-native';

// Components
import { Button } from '@/components/Button';
import { Typo } from '@/components/Typo';
import { PasswordInput } from '@/components/PasswordInput';

// Constants
import {
  ERROR_MESSAGES,
  MESSAGES,
  ResetPasswordFormData,
  resetPasswordSchema,
  ToastType,
} from '@/constants';

// Hooks
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToastAlert } from '@/hooks/useToast';

// Services
import { authService } from '@/features/auth/services/auth';
import { supabase } from '@/services/supabase/client';

export const ResetPasswordForm = () => {
  const params = useLocalSearchParams<{
    access_token: string;
    refresh_token: string;
  }>();
  const toast = useToastAlert();
  const { signOut } = useAuth();

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ResetPasswordFormData>({
    resolver: valibotResolver(resetPasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const isDisabled = isSubmitting || isLoading || !isDirty;

  const handleNewPasswordSubmit = useCallback(() => {
    confirmPasswordRef.current?.focus();
  }, []);

  const handleSubmitForm = useCallback(
    async (data: ResetPasswordFormData) => {
      // Set session with recovery token
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });

      if (sessionError) {
        toast.alert(
          ERROR_MESSAGES.UPDATE_FAILED,
          sessionError instanceof Error
            ? sessionError.message
            : ERROR_MESSAGES.UPDATE_PASSWORD_FAILED,
          [],
          { type: ToastType.ERROR },
        );
        return;
      }

      try {
        // Update password
        await authService.updatePassword(data.newPassword);

        toast.alert(
          MESSAGES.UPDATE_SUCCESS,
          MESSAGES.PASSWORD_UPDATE_SUCCESS,
          [
            {
              text: 'OK',
              onPress: async () => {
                await signOut();
              },
            },
          ],
          { type: ToastType.SUCCESS, mode: 'auto' },
        );
      } catch (error) {
        toast.alert(
          ERROR_MESSAGES.UPDATE_FAILED,
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.UPDATE_PASSWORD_FAILED,
          [],
          { type: ToastType.ERROR },
        );
      } finally {
        setIsLoading(false);
        await signOut();
      }
    },
    [params.access_token, params.refresh_token, signOut, toast],
  );

  return (
    <View className="flex-1 justify-between" testID="reset-password-form">
      <View className="w-full">
        <Typo size="2xl" weight="semibold" className="mb-2">
          Reset Password
        </Typo>
        <Typo size="base" className="text-text-secondary mb-8">
          Enter your new password below
        </Typo>

        {/* New Password Input */}
        <View className={errors.newPassword ? 'mb-4' : 'mb-9'}>
          <PasswordInput
            ref={newPasswordRef}
            control={control}
            name="newPassword"
            testID="new-password-input"
            onSubmitEditing={handleNewPasswordSubmit}
          />
        </View>

        {/* Confirm Password Input */}
        <View className={errors.confirmPassword ? 'mb-6' : 'mb-5'}>
          <PasswordInput
            ref={confirmPasswordRef}
            control={control}
            name="confirmPassword"
            testID="confirm-password-input"
            returnKeyType="done"
          />
        </View>
      </View>

      {/* Submit Button */}
      <Button
        accessible
        disabled={isDisabled}
        testID="reset-password-submit-button"
        title="Reset Password"
        accessibilityLabel="Reset Password"
        onPress={handleSubmit(handleSubmitForm)}
      />
    </View>
  );
};
