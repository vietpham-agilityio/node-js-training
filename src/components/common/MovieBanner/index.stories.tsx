import type { Meta, StoryObj } from '@storybook/react-native';
import { Alert, View } from 'react-native';

// Components
import { MovieBanner } from './';

// Types
import { MovieStatus, type Movie } from '@/types';

const meta: Meta<typeof MovieBanner> = {
  title: 'common/MovieBanner',
  component: MovieBanner,
  parameters: {
    notes:
      'A movie banner component with two variants: horizontal (300x200px with title and rating overlay) and vertical (103x147px, poster only). The horizontal variant displays a gradient overlay at the bottom with the movie title and rating. Uses expo-image for optimized image loading with blurhash placeholder. The component is clickable and provides accessibility features for screen readers.',
  },
  argTypes: {
    movie: {
      control: 'object',
      description:
        'Movie object containing id, title, posterUrl, rating, and other metadata',
    },
    variant: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description:
        'Display variant - horizontal: large with overlay info, vertical: compact poster only',
    },
    onPress: {
      action: 'pressed',
      description: 'Callback function called when banner is pressed',
    },
    accessibilityLabel: {
      control: 'text',
      description: 'Custom accessibility label for screen readers',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Mock movie data
const sampleMovie: Movie = {
  id: '1',
  title: 'Wreck It Ralph 2',
  synopsis: 'Ralph and Vanellope venture into the internet...',
  posterUrl: 'https://example.com/poster.jpg',
  rating: 4.7,
  durationMinutes: 112,
  genre: ['Animation', 'Comedy', 'Adventure'],
  language: 'EN',
  trailerUrl: 'https://example.com/trailer.mp4',
  releaseDate: '2023-06-15',
  createdAt: '2023-06-15T12:34:56Z',
  updatedAt: '2023-06-15T12:34:56Z',
  status: MovieStatus.NOW_PLAYING,
};

export const Horizontal: Story = {
  args: {
    movie: sampleMovie,
    variant: 'horizontal',
    onPress: () => console.log('Movie banner pressed'),
  },
};

export const Vertical: Story = {
  args: {
    movie: sampleMovie,
    variant: 'vertical',
    onPress: () => console.log('Movie banner pressed'),
  },
};

export const HorizontalWithLongTitle: Story = {
  args: {
    movie: {
      ...sampleMovie,
      title: 'The Lord of the Rings: The Fellowship of the Ring',
    },
    variant: 'horizontal',
    onPress: () => console.log('Movie banner pressed'),
  },
};

export const LowRating: Story = {
  args: {
    movie: {
      ...sampleMovie,
      rating: 2.3,
    },
    variant: 'horizontal',
    onPress: () => console.log('Movie banner pressed'),
  },
};

export const HighRating: Story = {
  args: {
    movie: {
      ...sampleMovie,
      rating: 5.0,
    },
    variant: 'horizontal',
    onPress: () => console.log('Movie banner pressed'),
  },
};

export const CustomAccessibility: Story = {
  args: {
    movie: sampleMovie,
    variant: 'horizontal',
    accessibilityLabel: 'Custom accessibility label for this movie',
    onPress: () => console.log('Movie banner pressed'),
  },
};

const BothVariantsComponent = () => {
  return (
    <View className="h-full p-6 bg-dark-blue gap-8">
      <View className="gap-3">
        <View className="text-white text-lg font-montserrat-bold">
          Horizontal Variant
        </View>
        <View className="text-white/70 text-sm font-montserrat-medium mb-2">
          300x200px with title and rating overlay
        </View>
        <MovieBanner
          movie={sampleMovie}
          variant="horizontal"
          onPress={() => Alert.alert('Movie Pressed', sampleMovie.title)}
        />
      </View>

      <View className="gap-3">
        <View className="text-white text-lg font-montserrat-bold">
          Vertical Variant
        </View>
        <View className="text-white/70 text-sm font-montserrat-medium mb-2">
          103x147px, poster only
        </View>
        <MovieBanner
          movie={sampleMovie}
          variant="vertical"
          onPress={() => Alert.alert('Movie Pressed', sampleMovie.title)}
        />
      </View>
    </View>
  );
};

export const BothVariants: Story = {
  render: () => <BothVariantsComponent />,
};

const DisabledStateComponent = () => {
  return (
    <View className="h-full p-6 bg-dark-blue gap-6">
      <View className="gap-3">
        <View className="text-white text-lg font-montserrat-bold">
          Enabled (Default)
        </View>
        <MovieBanner
          movie={sampleMovie}
          variant="horizontal"
          onPress={() => Alert.alert('Movie Selected', sampleMovie.title)}
        />
      </View>

      <View className="gap-3">
        <View className="text-white text-lg font-montserrat-bold">
          Disabled State
        </View>
        <View className="text-white/70 text-sm font-montserrat-medium mb-2">
          Not clickable, appears dimmed
        </View>
        <MovieBanner
          movie={sampleMovie}
          variant="horizontal"
          disabled={true}
          onPress={() => Alert.alert('Should not appear')}
          className="opacity-50"
        />
      </View>
    </View>
  );
};

export const DisabledState: Story = {
  render: () => <DisabledStateComponent />,
};

const CustomStylingComponent = () => {
  return (
    <View className="h-full p-6 bg-dark-blue gap-6">
      <View className="gap-3">
        <View className="text-white text-lg font-montserrat-bold">
          Default Styling
        </View>
        <MovieBanner
          movie={sampleMovie}
          variant="horizontal"
          onPress={() => Alert.alert('Default')}
        />
      </View>

      <View className="gap-3">
        <View className="text-white text-lg font-montserrat-bold">
          Custom Border
        </View>
        <MovieBanner
          movie={sampleMovie}
          variant="horizontal"
          className="border-2 border-yellow-500"
          onPress={() => Alert.alert('Custom border')}
        />
      </View>

      <View className="gap-3">
        <View className="text-white text-lg font-montserrat-bold">
          Custom Shadow
        </View>
        <MovieBanner
          movie={sampleMovie}
          variant="horizontal"
          className="shadow-xl"
          onPress={() => Alert.alert('Custom shadow')}
        />
      </View>
    </View>
  );
};

export const CustomStyling: Story = {
  render: () => <CustomStylingComponent />,
};
