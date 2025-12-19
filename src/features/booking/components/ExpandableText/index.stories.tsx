import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';

// Components
import { ExpandableText } from './';

const meta = {
  title: 'ExpandableText',
  component: ExpandableText,
  decorators: [
    Story => (
      <View className="p-4 bg-bg-dark">
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ExpandableText>;

export default meta;

type Story = StoryObj<typeof meta>;

const shortText = 'This is a short text that does not need expansion.';
const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

// Default Story
export const Default: Story = {
  args: {
    text: longText,
  },
};

// Short Text (No Expansion)
export const ShortText: Story = {
  args: {
    text: shortText,
  },
};

// Custom Max Length
export const CustomMaxLength: Story = {
  args: {
    text: longText,
    maxLength: 100,
  },
};

// Custom Text Size
export const CustomTextSize: Story = {
  args: {
    text: longText,
    textSize: 'base',
  },
};

// Custom Text Weight
export const CustomTextWeight: Story = {
  args: {
    text: longText,
    textWeight: 'medium',
  },
};

// Custom Styling
export const CustomStyling: Story = {
  args: {
    text: longText,
    textClassName: 'text-white/90',
    readMoreClassName: 'text-blue-400 mt-3',
    containerClassName: 'px-4',
  },
};

// Movie Synopsis Example
export const MovieSynopsis: Story = {
  args: {
    text: 'A gripping tale of adventure and discovery. Follow our hero as they embark on an epic journey through uncharted territories, facing challenges and uncovering secrets that will change everything. This is a story of courage, friendship, and the power of determination.',
    textSize: 'sm',
    textWeight: 'regular',
    textClassName: 'text-white/80',
    readMoreClassName: 'text-light-blue mt-2',
    maxLength: 150,
  },
};
