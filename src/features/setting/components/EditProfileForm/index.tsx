import { valibotResolver } from '@hookform/resolvers/valibot';
import { memo, useCallback, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TextInput, View } from 'react-native';

// Components
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

// Types
import { UpdateProfileData, UserProfile } from '@/features/auth/types/auth';

// Constants
import { EditProfileFormData, editProfileSchema } from '@/constants';

interface EditProfileProps {
  userInfo?: UserProfile;
  isPending: boolean;
  onSubmit: (data: UpdateProfileData) => void;
}

export const EditProfileForm = memo(
  ({ isPending, userInfo, onSubmit }: EditProfileProps) => {
    const fullNameRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const addressRef = useRef<TextInput>(null);
    const phoneNumberRef = useRef<TextInput>(null);

    const {
      control,
      handleSubmit,
      formState: { errors, isSubmitting, isDirty, dirtyFields },
    } = useForm<EditProfileFormData>({
      resolver: valibotResolver(editProfileSchema),
      mode: 'onBlur',
      reValidateMode: 'onBlur',
      defaultValues: {
        ...userInfo,
      },
    });

    const isDisabled = isSubmitting || isPending || !isDirty;

    const handleFullNameSubmit = useCallback(() => {
      emailRef.current?.focus();
    }, []);

    const handleEmailSubmit = useCallback(() => {
      addressRef.current?.focus();
    }, []);

    const handleAddressSubmit = useCallback(() => {
      phoneNumberRef.current?.focus();
    }, []);

    const handleSubmitForm = useCallback(
      (data: EditProfileFormData): void => {
        const dataUpdated = Object.keys(dirtyFields).reduce((acc, key) => {
          const fieldKey = key as keyof EditProfileFormData;
          const value = data[fieldKey];

          // Include the field if it's dirty
          if (dirtyFields[fieldKey]) {
            acc[fieldKey] = value || '';
          }

          return acc;
        }, {} as Partial<UpdateProfileData>);

        if (Object.keys(dataUpdated).length > 0) {
          onSubmit(dataUpdated);
        }
      },
      [dirtyFields, onSubmit],
    );

    return (
      <View className="flex-1 justify-between">
        <View className="w-full">
          <Controller
            control={control}
            name="avatarUrl"
            render={({ field: { value, onChange } }) => (
              <View className="items-center mt-4 mb-12">
                <Avatar
                  variant="picker"
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
          <View className={errors.address ? 'mb-4' : 'mb-9'}>
            {/* Address Input */}
            <Controller
              control={control}
              name="address"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <Input
                  ref={addressRef}
                  accessibilityRole="text"
                  accessibilityLabel="Address input field"
                  label="Address"
                  value={value || ''}
                  error={error?.message}
                  testID="edit-address-input"
                  autoCapitalize="none"
                  returnKeyType="next"
                  autoCorrect={false}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleAddressSubmit}
                />
              )}
            />
          </View>
          <View className={errors.phoneNumber ? 'mb-6' : 'mb-5'}>
            {/* Phone Number Input */}
            <Controller
              control={control}
              name="phoneNumber"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <Input
                  ref={phoneNumberRef}
                  accessibilityRole="text"
                  accessibilityLabel="Phone Number input field"
                  label="Phone Number"
                  value={value || ''}
                  error={error?.message}
                  testID="edit-phone-number-input"
                  containerClassName={`${errors.phoneNumber ? 'mb-1' : 'mb-7'}`}
                  autoCapitalize="none"
                  returnKeyType="done"
                  autoCorrect={false}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>
        </View>
        {/* Submit Button */}
        <View className="mb-12">
          <Button
            accessible
            disabled={isDisabled}
            testID="update-my-profile-submit-button"
            title="Update My Profile"
            accessibilityLabel="Update My Profile"
            onPress={handleSubmit(handleSubmitForm)}
          />
        </View>
      </View>
    );
  },
);

EditProfileForm.displayName = 'EditProfileForm';
