import { valibotResolver } from '@hookform/resolvers/valibot';
import { memo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { TextInput, TouchableOpacity, View } from 'react-native';

// Components
import { Button } from '@/components/Button';
import { EmailInput } from '@/components/EmailInput';
import { PasswordInput } from '@/components/PasswordInput';
import { Typo } from '@/components/Typo';

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
      formState: { errors, isSubmitting, isDirty },
    } = useForm<SignInFormData>({
      resolver: valibotResolver(signInSchema),
      mode: 'onBlur',
      reValidateMode: 'onBlur',
      defaultValues: {
        email: '',
        password: '',
      },
    });

    const isDisabled = isSubmitting || isPending || !isDirty;

    const handleEmailSubmit = () => {
      passwordRef.current?.focus();
    };

    const handleSubmitForm = (data: SignInFormData): void => {
      onSubmit(data);
    };

    return (
      <View className="w-full" testID="signin-form">
        {/* Email Address Input */}
        <View className={errors.email ? 'gap-4' : 'gap-9'}>
          <EmailInput
            ref={emailRef}
            control={control}
            name="email"
            testID="signin-email-input"
            onSubmitEditing={handleEmailSubmit}
          />

          {/* Password Input */}
          <PasswordInput
            ref={passwordRef}
            control={control}
            name="password"
            testID="signin-password-input"
            returnKeyType="done"
            containerClassName={errors.password ? 'mb-1' : 'mb-3'}
          />
        </View>

        <View className="w-full items-end">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onForgotPassword}
            accessibilityRole="button"
            accessibilityLabel="Forgot Password"
            accessibilityHint="Navigate to the forgot password screen"
            className="w-auto"
          >
            <Typo size="xs" weight="regular" className="text-right mb-7">
              Forgot Password?
            </Typo>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit(handleSubmitForm)}
          disabled={isDisabled}
          accessibilityHint="Sign in to your account"
          testID="signin-submit-button"
          title="Sign In"
          accessibilityLabel="Sign In"
        />
      </View>
    );
  },
);

SignInForm.displayName = 'SignInForm';
