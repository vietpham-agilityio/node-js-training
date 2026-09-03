import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

// Components
import { type InputReturnType } from '../Input';
import { PasswordInput } from './';

interface FormValues {
  password: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type PasswordFieldType =
  'password' | 'currentPassword' | 'newPassword' | 'confirmPassword';

// Wrapper component to provide react-hook-form context
const PasswordInputStory = ({
  name = 'password',
  label,
  defaultValue = '',
  returnKeyType = 'next',
}: {
  name?: PasswordFieldType;
  label?: string;
  defaultValue?: string;
  returnKeyType?: InputReturnType;
}) => {
  const { control } = useForm<FormValues>({
    defaultValues: {
      password: defaultValue,
      currentPassword: defaultValue,
      newPassword: defaultValue,
      confirmPassword: defaultValue,
    },
  });

  return (
    <PasswordInput
      control={control}
      name={name}
      testID="password-input"
      label={label}
      returnKeyType={returnKeyType}
    />
  );
};

const meta = {
  title: 'PasswordInput',
  component: PasswordInputStory,
  decorators: [
    Story => (
      <View className="p-4 bg-dark-blue">
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof PasswordInputStory>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default Password
export const Default: Story = {
  args: {
    name: 'password',
  },
};

// Current Password
export const CurrentPassword: Story = {
  args: {
    name: 'currentPassword',
  },
};

// New Password
export const NewPassword: Story = {
  args: {
    name: 'newPassword',
  },
};

// Confirm Password
export const ConfirmPassword: Story = {
  args: {
    name: 'confirmPassword',
  },
};

// With Custom Label
export const WithCustomLabel: Story = {
  args: {
    name: 'password',
    label: 'Secret Code',
  },
};

// With Value
export const WithValue: Story = {
  args: {
    name: 'password',
    defaultValue: 'MySecurePassword123',
  },
};

// With Done Return Key
export const WithDoneReturnKey: Story = {
  args: {
    name: 'password',
    returnKeyType: 'done',
  },
};
