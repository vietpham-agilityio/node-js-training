import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

// Components
import { UserCard } from './';

const meta = {
  title: 'feature/UserCard',
  component: UserCard,
  decorators: [
    Story => (
      <View className="p-4 bg-dark-blue items-center justify-center min-h-96">
        <Story />
      </View>
    ),
  ],
  argTypes: {
    imageUrl: {
      control: { type: 'text' },
      description: 'URL of the user profile image',
    },
    fullName: {
      control: { type: 'text' },
      description: 'Full name (will be split into first and last name)',
    },
  },
} satisfies Meta<typeof UserCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default Story
export const Default: Story = {
  args: {
    imageUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    fullName: 'John C. Reilly',
  },
};

// With Full Name
export const WithFullName: Story = {
  args: {
    imageUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    fullName: 'John C. Reilly',
  },
};

// First Name Only
export const FirstNameOnly: Story = {
  args: {
    imageUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    fullName: 'John',
  },
};

// Last Name Only
export const LastNameOnly: Story = {
  args: {
    imageUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    fullName: 'Reilly',
  },
};

// Without Image
export const WithoutImage: Story = {
  args: {
    fullName: 'John C. Reilly',
  },
};

// Long Name
export const LongName: Story = {
  args: {
    imageUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    fullName: 'Christopher Michael Pratt',
  },
};

// Single Word Name
export const SingleWordName: Story = {
  args: {
    imageUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    fullName: 'Madonna',
  },
};
