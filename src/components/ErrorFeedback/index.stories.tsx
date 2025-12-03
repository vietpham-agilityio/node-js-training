import type { Meta, StoryObj } from '@storybook/react-native';
import ErrorFeedback from './index';

const meta: Meta<typeof ErrorFeedback> = {
  title: 'ErrorFeedback',
  component: ErrorFeedback,
  parameters: {
    notes: 'A simple error feedback component that displays error messages in a red container.',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    error: 'An error occurred',
  },
};

export const LongError: Story = {
  args: {
    error: 'This is a very long error message that might wrap across multiple lines to test how the component handles longer text content.',
  },
};

export const ShortError: Story = {
  args: {
    error: 'Error!',
  },
};

