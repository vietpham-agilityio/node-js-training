import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';

// Components
import { Skeleton } from './index';

const meta = {
  title: 'Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  args: {
    width: 200,
    height: 100,
    borderRadius: 8,
    accessibilityLabel: 'Loading content',
  },
};

export const Rounded: Story = {
  args: {
    width: 100,
    height: 100,
    borderRadius: 50,
    accessibilityLabel: 'Loading avatar',
  },
};

export const Rectangle: Story = {
  args: {
    width: 300,
    height: 200,
    borderRadius: 12,
    accessibilityLabel: 'Loading card',
  },
};

export const CustomSize: Story = {
  args: {
    width: '100%',
    height: 84,
    borderRadius: 12,
    className: 'rounded-xl',
    accessibilityLabel: 'Loading promotion',
  },
  render: args => (
    <View style={{ width: 300 }}>
      <Skeleton {...args} />
    </View>
  ),
};

export const Multiple: Story = {
  render: () => (
    <View style={{ gap: 16, width: 300 }}>
      <Skeleton width="100%" height={200} borderRadius={12} />
      <Skeleton width="100%" height={100} borderRadius={8} />
      <Skeleton width="100%" height={50} borderRadius={8} />
    </View>
  ),
};
