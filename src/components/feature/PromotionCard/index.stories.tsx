import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';

// Components
import { PromotionCard } from './';
import { PromoCodeStatus } from '@/types';

const meta = {
  title: 'PromotionCard',
  component: PromotionCard,
  decorators: [
    Story => (
      <View className="p-4 bg-bg-dark">
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof PromotionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default Story
export const Default: Story = {
  args: {
    description: 'Student Holiday',
    discountType: PromoCodeStatus.PERCENTAGE,
    code: 'STUDENT10',
    discountValue: 10,
  },
};
