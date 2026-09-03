import type { Meta, StoryObj } from '@storybook/react-native';

// Components
import { Rating } from './';

const meta: Meta<typeof Rating> = {
  title: 'Rating',
  component: Rating,
  parameters: {
    notes:
      'A star rating component that displays 1-5 stars with partial fill support. Stars are gray (#E0E0E0) by default and fill with yellow (#FFAF34) based on the rating value. Supports decimal ratings for precise visual representation (e.g., 3.7 shows 3 full stars and 1 star that is 70% filled). The component uses SVG linear gradients to create smooth partial fills.',
  },
  argTypes: {
    rating: {
      control: { type: 'range', min: 0, max: 5, step: 0.1 },
      description:
        'Rating value from 0 to 5. Supports decimal values for partial star fills. Values are clamped between 0 and 5.',
    },
    size: {
      control: { type: 'number', min: 12, max: 48, step: 4 },
      description: 'Size of each star in pixels. Default is 24px.',
    },
    spacing: {
      control: { type: 'number', min: 0, max: 16, step: 2 },
      description: 'Space between stars in pixels. Default is 4px.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rating: 3.5,
    size: 24,
    spacing: 4,
  },
};

export const FullRating: Story = {
  args: {
    rating: 5,
    size: 24,
    spacing: 4,
  },
};

export const HalfRating: Story = {
  args: {
    rating: 2.5,
    size: 24,
    spacing: 4,
  },
};

export const HighRating: Story = {
  args: {
    rating: 4.7,
    size: 24,
    spacing: 4,
  },
};

export const LowRating: Story = {
  args: {
    rating: 1.2,
    size: 24,
    spacing: 4,
  },
};

export const ZeroRating: Story = {
  args: {
    rating: 0,
    size: 24,
    spacing: 4,
  },
};

export const SmallSize: Story = {
  args: {
    rating: 4,
    size: 16,
    spacing: 2,
  },
};

export const LargeSize: Story = {
  args: {
    rating: 4.5,
    size: 32,
    spacing: 6,
  },
};

export const TightSpacing: Story = {
  args: {
    rating: 3.7,
    size: 24,
    spacing: 2,
  },
};

export const WideSpacing: Story = {
  args: {
    rating: 3.7,
    size: 24,
    spacing: 8,
  },
};

export const NoSpacing: Story = {
  args: {
    rating: 4.2,
    size: 24,
    spacing: 0,
  },
};
