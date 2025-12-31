import { valibotResolver } from '@hookform/resolvers/valibot';
import { memo, useCallback, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TextInput, View } from 'react-native';

// Components
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { EditableAvatar } from '@/features/camera/components/EditableAvatar';

// Types
import { SignUpData } from '@/features/auth/types/auth';

// Constants
import { SignUpFormData, signUpSchema } from '@/constants';

interface SignUpFormProps {
  isPending: boolean;
  onSubmit: (data: SignUpData) => void;
}

export const SignUpForm = memo(({ isPending, onSubmit }: SignUpFormProps) => {
  const fullNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SignUpFormData>({
    resolver: valibotResolver(signUpSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      avatarUrl: undefined,
    },
  });

  const isDisabled = isSubmitting || isPending || !isDirty;

  const handleFullNameSubmit = useCallback(() => {
    emailRef.current?.focus();
  }, []);

  const handleEmailSubmit = useCallback(() => {
    passwordRef.current?.focus();
  }, []);

  const handlePasswordSubmit = useCallback(() => {
    confirmPasswordRef.current?.focus();
  }, []);

  const handleSubmitForm = useCallback(
    (data: SignUpFormData): void => {
      const signUpData: SignUpData = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        avatarUrl: data.avatarUrl,
      };
      onSubmit(signUpData);
    },
    [onSubmit],
  );

  return (
    <View className="w-full" testID="signup-form">
      <Controller
        control={control}
        name="avatarUrl"
        render={({ field: { value, onChange } }) => (
          <View className="items-center mb-12">
            <EditableAvatar
              source={value}
              accessibilityLabel="Select avatar"
              onChangeImage={uri => onChange(uri)}
            />
          </View>
        )}
      />

      {/* Full Name Input */}
      <View className={errors.fullName ? 'mb-4' : 'mb-9'}>
        <Controller
          control={control}
          name="fullName"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Input
              ref={fullNameRef}
              accessibilityRole="text"
              accessibilityLabel="Full Name input field"
              accessibilityHint="Type your full name"
              label="Full Name"
              value={value}
              error={error?.message}
              testID="signup-fullname-input"
              returnKeyType="next"
              autoCapitalize="words"
              autoCorrect={false}
              onChangeText={onChange}
              onBlur={onBlur}
              onSubmitEditing={handleFullNameSubmit}
            />
          )}
        />
      </View>
      <View className={errors.email ? 'mb-4' : 'mb-9'}>
        {/* Email Address Input */}
        <Controller
          control={control}
          name="email"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Input
              ref={emailRef}
              accessibilityRole="text"
              accessibilityLabel="Email Address input field"
              accessibilityHint="Type your email address"
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
              onSubmitEditing={handleEmailSubmit}
            />
          )}
        />
      </View>
      <View className={errors.password ? 'mb-4' : 'mb-9'}>
        {/* Password Input */}
        <Controller
          control={control}
          name="password"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Input
              ref={passwordRef}
              accessibilityRole="text"
              accessibilityLabel="Password input field"
              accessibilityHint="Type your password"
              secureTextEntry
              label="Password"
              value={value}
              error={error?.message}
              testID="signup-password-input"
              autoCapitalize="none"
              returnKeyType="next"
              autoCorrect={false}
              onChangeText={onChange}
              onBlur={onBlur}
              onSubmitEditing={handlePasswordSubmit}
            />
          )}
        />
      </View>
      <View className={errors.confirmPassword ? 'mb-6' : 'mb-5'}>
        {/* Confirm Password Input */}
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
              accessibilityHint="Type your confirm password"
              secureTextEntry
              label="Confirm Password"
              value={value}
              error={error?.message}
              testID="signup-confirmpassword-input"
              containerClassName={`${errors.confirmPassword ? 'mb-1' : 'mb-7'}`}
              autoCapitalize="none"
              returnKeyType="done"
              autoCorrect={false}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
      </View>

      {/* Submit Button */}
      <Button
        accessible
        disabled={isDisabled}
        testID="signup-submit-button"
        title="Sign Up"
        accessibilityLabel="Sign Up"
        accessibilityHint="Sign up to your account"
        onPress={handleSubmit(handleSubmitForm)}
      />
    </View>
  );
});

SignUpForm.displayName = 'SignUpForm';
