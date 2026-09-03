import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

// Components
import { ConfirmationState } from '.';

// Icons
import { CancelIcon } from '@/icons/CancelIcon';
import { TicketCheckedIcon } from '@/icons/TicketCheckedIcon';
import { TicketIcon } from '@/icons/TicketIcon';

const meta: Meta<typeof ConfirmationState> = {
  title: 'ConfirmationState',
  component: ConfirmationState,
  decorators: [
    Story => (
      <View className="flex-1 p-4 bg-dark-blue items-center justify-center">
        <Story />
      </View>
    ),
  ],
  parameters: {
    notes:
      'A confirmation state component that displays an icon, title, and description. Used for success, error, or informational states throughout the app.',
  },
  argTypes: {
    icon: {
      control: false,
      description: 'React node representing the icon to display',
    },
    title: {
      control: 'text',
      description: 'The main title text displayed below the icon',
    },
    description: {
      control: 'text',
      description: 'The description text displayed below the title',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Default Story - Success State
export const Success: Story = {
  args: {
    icon: TicketCheckedIcon,
    title: 'Enjoy Your Movie!',
    description:
      'Woo hoo! You have successfully booked your ticket. Enjoy watching your movie!',
  },
};

// Error State
export const Error: Story = {
  args: {
    icon: CancelIcon,
    title: 'Booking Failed',
    description:
      'We encountered an issue processing your booking. Please try again or contact support if the problem persists.',
  },
};

// Info State
export const Info: Story = {
  args: {
    icon: TicketIcon,
    title: 'Booking Pending',
    description:
      'Your booking is being processed. You will receive a confirmation email shortly.',
  },
};

// Long Description
export const LongDescription: Story = {
  args: {
    icon: TicketCheckedIcon,
    title: 'Success!',
    description:
      'This is a longer description to test how the component handles multiple lines of text. The description should wrap properly and remain centered within the maximum width constraint.',
  },
};

// Short Text
export const ShortText: Story = {
  args: {
    icon: TicketCheckedIcon,
    title: 'Done',
    description: 'Complete.',
  },
};
