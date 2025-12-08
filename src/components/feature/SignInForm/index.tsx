import { memo, useMemo, useRef } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';

// Components
import { Button, Input, Typo } from '@/components/common';

// Types
import { SignInData } from '@/types';

// Constants
import { SignInFormData, signInSchema } from '@/constants';

interface SignInFormProps {
  isPending: boolean;
  onSubmit: (data: SignInFormData) => void;
  onForgotPassword?: () => void;
}

export const SignInForm = memo(
  ({ isPending, onSubmit, onForgotPassword }: SignInFormProps) => {
    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);

    const {
      control,
      handleSubmit,
      formState: { errors, isValid, isDirty },
    } = useForm<SignInFormData>({
      resolver: valibotResolver(signInSchema),
      mode: 'onBlur',
      reValidateMode: 'onBlur',
      defaultValues: {
        email: '',
        password: '',
      },
    });

    const isDisabled = useMemo(() => {
      return !isValid || !isDirty;
    }, [isDirty, isValid]);

    const handleEmailSubmit = () => {
      passwordRef.current?.focus();
    };

    const handleSubmitForm = (data: SignInFormData): void => {
      const signInData: SignInData = {
        email: data.email,
        password: data.password,
      };
      onSubmit(signInData);
    };

    return (
      <View className="w-full">
        {/* Email Address Input */}
        <View className={errors.email ? 'gap-4' : 'gap-9'}>
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
                label="Email Address"
                value={value}
                error={error?.message}
                testID="signin-email-input"
                keyboardType="email-address"
                returnKeyType="next"
                autoCapitalize="none"
                onChangeText={onChange}
                onBlur={onBlur}
                autoCorrect={false}
                onSubmitEditing={handleEmailSubmit}
              />
            )}
          />

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
                secureTextEntry
                label="Password"
                value={value}
                error={error?.message}
                testID="signin-password-input"
                containerClassName={`${errors.password ? 'mb-1' : 'mb-3'}`}
                autoCapitalize="none"
                returnKeyType="done"
                autoCorrect={false}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onForgotPassword}
          accessibilityRole="button"
          accessibilityLabel="Forgot Password"
        >
          <Typo size="xs" weight="regular" className="text-right mb-7">
            Forgot Password?
          </Typo>
        </TouchableOpacity>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit(handleSubmitForm)}
          disabled={isDisabled || isPending}
          testID="signin-submit-button"
          title="Sign In"
          accessibilityLabel="Login"
        />
      </View>
    );
  },
);

SignInForm.displayName = 'SignInForm';
