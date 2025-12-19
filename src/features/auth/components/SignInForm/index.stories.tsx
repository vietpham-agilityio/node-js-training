import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

// Components
import { SignInForm } from '.';

const meta: Meta<typeof SignInForm> = {
  title: 'Feature/SignInForm',
  component: SignInForm,
  decorators: [
    Story => (
      <View className="flex-1 p-4 bg-dark-blue">
        <Story />
      </View>
    ),
  ],
  parameters: {
    notes:
      'A sign-in form component with email and password fields. Includes validation, error handling, and auto-focus navigation between fields. The submit button is disabled until all fields are valid.',
  },
  argTypes: {
    isPending: {
      control: 'boolean',
      description: 'Whether the form is in a pending/loading state',
    },
    onSubmit: {
      action: 'submitted',
      description:
        'Callback function called when form is submitted with valid data',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Default Story - Empty form
export const Default: Story = {
  args: {
    isPending: false,
    onSubmit: () => {},
  },
};

// Loading State - Form is submitting
export const Loading: Story = {
  args: {
    isPending: true,
    onSubmit: () => {},
  },
};
