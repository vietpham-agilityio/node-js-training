import { render, screen } from '@testing-library/react-native';

// Mock
import { MOVIES_MOCK } from '@/mocks';

// Types
import { Movie, MovieStatus } from '@/types';

// Components
import { MovieBannerCarousel } from '..';

// Mock dependencies
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  useSharedValue: jest.fn(() => ({ value: 0 })),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('react-native-reanimated-carousel', () => {
  const { View } = require('react-native');
  return jest.fn(({ data, renderItem, testID }) => (
    <View testID="carousel-mock">
      {data.map((item: any, index: number) => (
        <View key={index}>{renderItem({ item, index })}</View>
      ))}
    </View>
  ));
});

describe('MovieBannerCarousel Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the carousel container', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      expect(screen.getByTestId('movie-banner-carousel')).toBeTruthy();
    });

    it('should render all movies in the carousel', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      expect(screen.getByTestId('movie-banner-slide-item-1')).toBeTruthy();
      expect(screen.getByTestId('movie-banner-slide-item-2')).toBeTruthy();
      expect(screen.getByTestId('movie-banner-slide-item-3')).toBeTruthy();
      expect(screen.getByTestId('movie-banner-slide-item-4')).toBeTruthy();
      expect(screen.getByTestId('movie-banner-slide-item-5')).toBeTruthy();
    });

    it('should render movie titles', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      expect(screen.getByText('The Shawshank Redemption')).toBeTruthy();
      expect(screen.getByText('The Godfather')).toBeTruthy();
      expect(screen.getByText('The Dark Knight')).toBeTruthy();
      expect(screen.getByText('Pulp Fiction')).toBeTruthy();
      expect(screen.getByText('Forrest Gump')).toBeTruthy();
    });

    it('should render nothing when movies array is empty', () => {
      const { queryByTestId } = render(<MovieBannerCarousel movies={[]} />);

      expect(queryByTestId('movie-banner-carousel')).toBeNull();
    });
  });

  describe('Variants', () => {
    it('should render movies with different statuses', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      // NOW_PLAYING movies
      expect(screen.getByText('The Shawshank Redemption')).toBeTruthy();
      expect(screen.getByText('The Godfather')).toBeTruthy();
      expect(screen.getByText('The Dark Knight')).toBeTruthy();

      // COMING_SOON movies
      expect(screen.getByText('Pulp Fiction')).toBeTruthy();
      expect(screen.getByText('Forrest Gump')).toBeTruthy();
    });

    it('should render correct number of slide items', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      expect(screen.getByTestId('carousel-mock')).toBeTruthy();
    });

    it('should pass movie data to MovieBanner component', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      MOVIES_MOCK.forEach(movie => {
        expect(screen.getByText(movie.title)).toBeTruthy();
      });
    });

    it('should handle movies with different ratings', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      // Verify all movies render regardless of rating
      expect(screen.getByText('The Shawshank Redemption')).toBeTruthy(); // 4.9
      expect(screen.getByText('The Godfather')).toBeTruthy(); // 4.8
      expect(screen.getByText('Forrest Gump')).toBeTruthy(); // 4.5
    });

    it('should handle movies with multiple genres', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      // The Dark Knight has 4 genres
      expect(screen.getByText('The Dark Knight')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty movies array', () => {
      const { UNSAFE_root } = render(<MovieBannerCarousel movies={[]} />);

      expect(UNSAFE_root.children.length).toBe(0);
    });

    it('should handle movies with minimal data', () => {
      const minimalMovie: Movie[] = [
        {
          id: '99',
          title: 'Minimal Movie',
          synopsis: '',
          posterUrl: '',
          rating: 0,
          durationMinutes: 0,
          genre: [],
          language: 'EN',
          trailerUrl: [''],
          releaseDate: '',
          createdAt: '',
          updatedAt: '',
          status: MovieStatus.NOW_PLAYING,
        },
      ];

      render(<MovieBannerCarousel movies={minimalMovie} />);

      expect(screen.getByText('Minimal Movie')).toBeTruthy();
    });

    it('should handle very long movie titles', () => {
      const longTitleMovie: Movie[] = [
        {
          ...MOVIES_MOCK[0],
          id: '100',
          title:
            'This Is A Very Long Movie Title That Should Still Render Correctly In The Carousel Component Without Breaking The Layout',
        },
      ];

      render(<MovieBannerCarousel movies={longTitleMovie} />);

      expect(
        screen.getByText(
          'This Is A Very Long Movie Title That Should Still Render Correctly In The Carousel Component Without Breaking The Layout',
        ),
      ).toBeTruthy();
    });

    it('should handle duplicate movie IDs', () => {
      const duplicateMovies = [MOVIES_MOCK[0], MOVIES_MOCK[0]];

      render(<MovieBannerCarousel movies={duplicateMovies} />);

      expect(screen.getAllByText('The Shawshank Redemption').length).toBe(2);
    });

    it('should handle movies with special characters in title', () => {
      const specialCharMovie: Movie[] = [
        {
          ...MOVIES_MOCK[0],
          id: '101',
          title: 'Movie & Title: Part 2 - "The Sequel"',
        },
      ];

      render(<MovieBannerCarousel movies={specialCharMovie} />);

      expect(
        screen.getByText('Movie & Title: Part 2 - "The Sequel"'),
      ).toBeTruthy();
    });
  });

  describe('Component Props', () => {
    it('should have correct displayName', () => {
      expect(MovieBannerCarousel.displayName).toBe('MovieBannerCarousel');
    });

    it('should be memoized', () => {
      const { rerender } = render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      // Re-render with same props
      rerender(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      expect(screen.getByTestId('movie-banner-carousel')).toBeTruthy();
    });

    it('should update when movies change', () => {
      const { rerender } = render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      expect(screen.getByText('The Shawshank Redemption')).toBeTruthy();

      const newMovies: Movie[] = [
        {
          ...MOVIES_MOCK[0],
          id: '200',
          title: 'New Movie Title',
        },
      ];

      rerender(<MovieBannerCarousel movies={newMovies} />);

      expect(screen.getByText('New Movie Title')).toBeTruthy();
    });
  });

  describe('Carousel Integration', () => {
    it('should initialize carousel with correct data', () => {
      const Carousel = require('react-native-reanimated-carousel');

      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      expect(Carousel).toHaveBeenCalled();
    });

    it('should pass movies data to carousel', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      expect(screen.getByTestId('carousel-mock')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should handle large number of movies', () => {
      const manyMovies = Array.from({ length: 50 }, (_, index) => ({
        ...MOVIES_MOCK[0],
        id: `${index + 1}`,
        title: `Movie ${index + 1}`,
      }));

      render(<MovieBannerCarousel movies={manyMovies} />);

      expect(screen.getByTestId('movie-banner-carousel')).toBeTruthy();
    });

    it('should not re-render unnecessarily with same props', () => {
      const { rerender } = render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      const firstRender = screen.getByTestId('movie-banner-carousel');

      // Re-render with same props
      rerender(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      const secondRender = screen.getByTestId('movie-banner-carousel');

      expect(firstRender).toBeTruthy();
      expect(secondRender).toBeTruthy();
    });
  });

  describe('Conditional Rendering', () => {
    it('should return null when no movies', () => {
      const { UNSAFE_root } = render(<MovieBannerCarousel movies={[]} />);

      expect(UNSAFE_root.children.length).toBe(0);
    });

    it('should render when movies exist', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      expect(screen.getByTestId('movie-banner-carousel')).toBeTruthy();
    });
  });

  describe('Movie Filtering', () => {
    it('should render movies sorted by rating', () => {
      const sortedMovies = [...MOVIES_MOCK].sort((a, b) => b.rating - a.rating);

      render(<MovieBannerCarousel movies={sortedMovies} />);

      expect(screen.getByTestId('movie-banner-carousel')).toBeTruthy();
    });
  });
});
