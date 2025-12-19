import { valibotResolver } from '@hookform/resolvers/valibot';
import { useRouter } from 'expo-router';
import { memo, useCallback, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TextInput, View } from 'react-native';

// Components
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

// Hooks
import { useUpdatePassword } from '@/hooks/useSession';
import { useToastAlert } from '@/hooks/useToast';

// Constants
import {
  ChangePasswordFormData,
  changePasswordSchema,
  ERROR_MESSAGES,
  MESSAGES,
  ToastType,
} from '@/constants';

export const ChangePasswordForm = memo(() => {
  const toast = useToastAlert();
  const router = useRouter();
  const { mutate: updatePassword, isPending } = useUpdatePassword();

  const currentPasswordRef = useRef<TextInput>(null);
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ChangePasswordFormData>({
    resolver: valibotResolver(changePasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const isDisabled = isSubmitting || isPending || !isDirty;

  const handleCurrentPasswordSubmit = useCallback(() => {
    newPasswordRef.current?.focus();
  }, []);

  const handleNewPasswordSubmit = useCallback(() => {
    confirmPasswordRef.current?.focus();
  }, []);

  const handleSubmitForm = useCallback(
    (data: ChangePasswordFormData): void => {
      updatePassword(data, {
        onSuccess: () => {
          toast.alert(
            MESSAGES.UPDATE_SUCCESS,
            MESSAGES.PASSWORD_UPDATE_SUCCESS,
            [
              {
                text: 'OK',
                onPress: () => {
                  router.back();
                },
              },
            ],
            { type: ToastType.SUCCESS },
          );
        },
        onError: error => {
          toast.alert(
            ERROR_MESSAGES.UPDATE_FAILED,
            error instanceof Error
              ? error.message
              : ERROR_MESSAGES.UPDATE_PASSWORD_FAILED,
            [],
            { type: ToastType.ERROR },
          );
        },
      });
    },
    [router, toast, updatePassword],
  );

  return (
    <View className="flex-1 justify-between">
      <View className="w-full">
        {/* Current Password Input */}
        <View className={errors.currentPassword ? 'mb-4' : 'mb-9'}>
          <Controller
            control={control}
            name="currentPassword"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                ref={currentPasswordRef}
                accessibilityRole="text"
                accessibilityLabel="Current Password input field"
                label="Current Password"
                value={value}
                error={error?.message}
                testID="current-password-input"
                secureTextEntry
                returnKeyType="next"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={onChange}
                onBlur={onBlur}
                onSubmitEditing={handleCurrentPasswordSubmit}
              />
            )}
          />
        </View>

        {/* New Password Input */}
        <View className={errors.newPassword ? 'mb-4' : 'mb-9'}>
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
                label="Password"
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
        </View>

        {/* Confirm Password Input */}
        <View className={errors.confirmPassword ? 'mb-6' : 'mb-5'}>
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
        </View>
      </View>

      {/* Submit Button */}
      <Button
        accessible
        disabled={isDisabled}
        testID="change-password-submit-button"
        title="Change Password"
        accessibilityLabel="Change Password"
        onPress={handleSubmit(handleSubmitForm)}
      />
    </View>
  );
});

ChangePasswordForm.displayName = 'ChangePasswordForm';
