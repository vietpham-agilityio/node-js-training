import { valibotResolver } from '@hookform/resolvers/valibot';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

// Uniwind
import { withUniwind } from 'uniwind';

// Components
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

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

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

export const ResetPasswordForm = () => {
  const params = useLocalSearchParams<{
    access_token: string;
    refresh_token: string;
  }>();
  const toast = useToastAlert();
  const { signOut } = useAuth();

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: valibotResolver(resetPasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

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
          { type: ToastType.SUCCESS },
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
      }
    },
    [params.access_token, params.refresh_token, signOut, toast],
  );

  return (
    <StyledView className="flex-1 justify-between" testID="reset-password-form">
      <StyledView className="w-full">
        <StyledText className="text-text-primary text-2xl font-bold mb-2">
          Reset Password
        </StyledText>
        <StyledText className="text-text-secondary text-base mb-8">
          Enter your new password below
        </StyledText>

        {/* New Password Input */}
        <StyledView className={errors.newPassword ? 'mb-4' : 'mb-9'}>
          <Controller
            control={control}
            name="newPassword"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                ref={newPasswordRef}
                accessibilityRole="text"
                accessibilityLabel="New Password input field"
                label="New Password"
                value={value}
                error={error?.message}
                testID="new-password-input"
                secureTextEntry
                returnKeyType="next"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={onChange}
                onBlur={onBlur}
                onSubmitEditing={handleNewPasswordSubmit}
              />
            )}
          />
        </StyledView>

        {/* Confirm Password Input */}
        <StyledView className={errors.confirmPassword ? 'mb-6' : 'mb-5'}>
          <Controller
            control={control}
            name="confirmPassword"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                ref={confirmPasswordRef}
                accessibilityRole="text"
                accessibilityLabel="Confirm Password input field"
                label="Confirm Password"
                value={value}
                error={error?.message}
                testID="confirm-password-input"
                secureTextEntry
                returnKeyType="done"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </StyledView>
      </StyledView>

      {/* Submit Button */}
      <Button
        accessible
        disabled={isSubmitting}
        testID="reset-password-submit-button"
        title="Reset Password"
        accessibilityLabel="Reset Password"
        onPress={handleSubmit(handleSubmitForm)}
      />
    </StyledView>
  );
};
