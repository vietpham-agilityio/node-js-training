import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';

// Components
import { Input } from './';

const meta = {
  title: 'Input',
  component: Input,
  decorators: [
    Story => (
      <View className="p-4 bg-dark-blue">
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default Story
export const Default: Story = {
  args: {
    label: 'Email Address',
    testID: 'email-input',
    onChangeText: () => {},
  },
};

// With Value
export const WithValue: Story = {
  args: {
    label: 'Email Address',
    value: 'awekadesign@gmail.com',
    testID: 'email-value-input',
    onChangeText: () => {},
  },
};

// Error State
export const ErrorState: Story = {
  args: {
    label: 'Email Address',
    value: 'Awekades',
    error: 'Please enter a valid email address',
    testID: 'email-error-input',
    onChangeText: () => {},
  },
};

// Password Input
export const PasswordInput: Story = {
  args: {
    label: 'Password',
    secureTextEntry: true,
    testID: 'password-input',
    onChangeText: () => {},
  },
};

// Password with Value
export const PasswordWithValue: Story = {
  args: {
    label: 'Password',
    value: 'MySecurePassword123',
    secureTextEntry: true,
    testID: 'password-value-input',
    onChangeText: () => {},
  },
};
