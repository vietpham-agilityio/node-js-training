import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';

// Components
import Typo from './';

const meta = {
  title: 'Common/Typo',
  component: Typo,
  decorators: [
    Story => (
      <View className="p-4 bg-bg-dark">
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Typo>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default Story
export const Default: Story = {
  args: {
    children: 'Default Typography',
  },
};

// Font Sizes
export const FontSizes: Story = {
  args: {
    size: 'lg',
    weight: 'medium',
    children: 'text with font sizes',
  },
  render: () => (
    <View style={{ gap: 12 }}>
      <Typo size="3xs">3XS - 10px: The quick brown fox</Typo>
      <Typo size="2xs">2XS - 12px: The quick brown fox</Typo>
      <Typo size="xs">XS - 14px: The quick brown fox</Typo>
      <Typo size="sm">SM - 15px: The quick brown fox</Typo>
      <Typo size="base">Base - 16px: The quick brown fox</Typo>
      <Typo size="lg">LG - 18px: The quick brown fox</Typo>
      <Typo size="xl">XL - 20px: The quick brown fox</Typo>
      <Typo size="2xl">2XL - 24px: The quick brown fox</Typo>
    </View>
  ),
};

// Font Weights
export const FontWeights: Story = {
  args: {
    size: 'lg',
    weight: 'medium',
    children: 'text with font weights',
  },
  render: ({ size, weight, children }) => (
    <View className="gap-4">
      <Typo size={size} weight={weight}>
        {children}
      </Typo>
      <Typo weight="light">
        Light (300): The quick brown fox jumps over the lazy dog
      </Typo>
      <Typo weight="regular">
        Regular (400): The quick brown fox jumps over the lazy dog
      </Typo>
      <Typo weight="medium">
        Medium (500): The quick brown fox jumps over the lazy dog
      </Typo>
      <Typo weight="semibold">
        SemiBold (600): The quick brown fox jumps over the lazy dog
      </Typo>
    </View>
  ),
};

// Colors
export const Colors: Story = {
  args: {
    size: 'lg',
    weight: 'medium',
    children: 'text with color palette',
  },
  render: ({ size, weight }) => (
    <View style={{ gap: 12 }}>
      <Typo size="lg" weight="medium">
        White Text
      </Typo>
      <Typo size="lg" weight="medium" className="text-gray-400">
        Gray Text
      </Typo>
      <Typo size="lg" weight="medium" className="text-blue-500">
        Blue Text
      </Typo>
      <Typo size="lg" weight="medium" className="text-red-500">
        Red Text
      </Typo>
      <Typo size="lg" weight="medium" className="text-green-500">
        Green Text
      </Typo>
    </View>
  ),
};

// Combined Styles
export const Heading: Story = {
  args: {
    children: 'This is a Heading',
    size: '2xl',
    weight: 'semibold',
  },
};

export const Subheading: Story = {
  args: {
    children: 'This is a Subheading',
    size: 'xl',
    weight: 'medium',
  },
};

export const Body: Story = {
  args: {
    children: 'This is body text with regular weight and base size.',
    size: 'base',
    weight: 'regular',
  },
};

export const Caption: Story = {
  args: {
    children: 'This is a caption with small size',
    size: 'xs',
    weight: 'regular',
  },
};

// With Custom ClassName
export const WithCustomClassName: Story = {
  args: {
    children: 'Custom styled text',
    size: 'lg',
    weight: 'medium',
    className: 'underline italic',
  },
};

// Long Text
export const LongText: Story = {
  args: {
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    size: 'base',
    weight: 'regular',
  },
  render: ({ children, size, weight }) => (
    <View style={{ maxWidth: 400 }}>
      <Typo size={size} weight={weight}>
        {children}
      </Typo>
    </View>
  ),
};
