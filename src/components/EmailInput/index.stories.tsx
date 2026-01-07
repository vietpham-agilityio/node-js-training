import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

// Components
import { type InputReturnType } from '../Input';
import { EmailInput } from './';

interface FormValues {
  email: string;
}

// Wrapper component to provide react-hook-form context
const EmailInputStory = ({
  label,
  defaultValue = '',
  returnKeyType = 'next',
}: {
  label?: string;
  defaultValue?: string;
  returnKeyType?: InputReturnType;
}) => {
  const { control } = useForm<FormValues>({
    defaultValues: { email: defaultValue },
  });

  return (
    <EmailInput
      control={control}
      name="email"
      testID="email-input"
      label={label}
      returnKeyType={returnKeyType}
    />
  );
};

const meta = {
  title: 'EmailInput',
  component: EmailInputStory,
  decorators: [
    Story => (
      <View className="p-4 bg-dark-blue">
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof EmailInputStory>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default Story
export const Default: Story = {
  args: {},
};

// With Custom Label
export const WithCustomLabel: Story = {
  args: {
    label: 'Work Email',
  },
};

// With Value
export const WithValue: Story = {
  args: {
    defaultValue: 'awekadesign@gmail.com',
  },
};

// With Done Return Key
export const WithDoneReturnKey: Story = {
  args: {
    returnKeyType: 'done',
  },
};
