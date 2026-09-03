import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Divider } from '.';

const meta = {
  title: 'Divider',
  component: Divider,
  decorators: [
    Story => (
      <View className="p-4 bg-dark-blue w-full">
        <Story />
      </View>
    ),
  ],
  argTypes: {
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes for custom styling',
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default Story
export const Default: Story = {
  args: {},
};

// With Margin
export const WithMargin: Story = {
  args: {
    className: 'my-4',
  },
};

// With Large Margin
export const WithLargeMargin: Story = {
  args: {
    className: 'my-8',
  },
};

// With Top Margin Only
export const WithTopMargin: Story = {
  args: {
    className: 'mt-6',
  },
};

// With Bottom Margin Only
export const WithBottomMargin: Story = {
  args: {
    className: 'mb-6',
  },
};
