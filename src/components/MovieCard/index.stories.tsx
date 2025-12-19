import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

// Components
import { MovieCard } from './';

// Constants
import { Size } from '@/constants';

const meta = {
  title: 'feature/MovieCard',
  component: MovieCard,
  decorators: [
    Story => (
      <View className="p-4 bg-dark-blue">
        <Story />
      </View>
    ),
  ],
  argTypes: {
    imageSize: {
      control: { type: 'select' },
      options: [Size.SMALL, Size.MEDIUM, Size.LARGE],
      description: 'Size of the movie poster image',
    },
    rating: {
      control: { type: 'number', min: 0, max: 5, step: 0.1 },
      description: 'Movie rating from 0 to 5',
    },
  },
} satisfies Meta<typeof MovieCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default Story - Detailed Info Mode
export const Default: Story = {
  args: {
    title: 'Spider Man: No Way Home',
    posterUrl:
      'https://media.themoviedb.org/t/p/w600_and_h900_face/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    durationMinutes: 112,
    genre: ['Action', 'Comedy', 'Adventure'],
    rating: 4.7,
  },
};

// With Booking Info
export const WithBookingInfo: Story = {
  args: {
    title: 'Ralph Breaks the Internet',
    posterUrl:
      'https://image.tmdb.org/t/p/w500/lvfIaThG5HA8THf76nghKinjjji.jpg',
    durationMinutes: 112,
    genre: ['Animation', 'Comedy'],
    showtime: '16:40',
    showDate: 'Sun May 22',
    price: '150.000',
    cinemaLocation: 'FX Sudirman XXI',
    imageSize: Size.MEDIUM,
  },
};

// With Price Only
export const WithPrice: Story = {
  args: {
    title: 'How To Train Your Dragon',
    posterUrl:
      'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    durationMinutes: 104,
    genre: ['Animation', 'Adventure'],
    price: '150.000',
  },
};

// Without Rating
export const WithoutRating: Story = {
  args: {
    title: 'Inception',
    posterUrl:
      'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    durationMinutes: 148,
    genre: ['Action', 'Sci-Fi', 'Thriller'],
  },
};

// With Cinema Location Only
export const WithCinemaLocation: Story = {
  args: {
    title: 'Pulp Fiction',
    posterUrl:
      'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    durationMinutes: 154,
    genre: ['Crime', 'Drama'],
    cinemaLocation: 'Metro Center',
  },
};

// Complete Booking Info
export const CompleteBookingInfo: Story = {
  args: {
    title: 'The Shawshank Redemption',
    posterUrl:
      'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    durationMinutes: 142,
    genre: ['Drama'],
    showtime: '14:20',
    showDate: 'Tue May 24',
    price: '120.000',
    cinemaLocation: 'Plaza Indonesia XXI',
  },
};
