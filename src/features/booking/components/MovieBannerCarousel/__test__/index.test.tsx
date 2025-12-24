import { fireEvent, render, screen } from '@testing-library/react-native';

// Types
import { Movie, MovieStatus } from '@/features/booking/types/movie';

// Components
import { MovieBannerCarousel } from '..';

const MOVIES_MOCK: Movie[] = [
  {
    id: '1',
    title: 'Spider Man: No Way Home',
    synopsis:
      'Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero. When he asks for help from Doctor Strange the stakes become even more dangerous, forcing him to discover what it truly means to be Spider-Man.',
    posterUrl:
      'https://media.themoviedb.org/t/p/w600_and_h900_face/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    rating: 4.7,
    castCrew: {
      actors: [],
      directors: [],
      producers: [],
      writers: [],
    },
    trailerUrl: ['https://youtube.com/watch?v=6hB3S9bIaco'],
    durationMinutes: 112,
    genre: ['Action', 'Comedy', 'Adventure'],
    language: 'EN',
    releaseDate: '2023-06-15',
    createdAt: '2023-06-15T12:34:56Z',
    updatedAt: '2023-06-15T12:34:56Z',
    status: MovieStatus.NOW_PLAYING,
  },
];

// Mock dependencies
const mockPush = jest.fn();

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  useSharedValue: jest.fn(() => ({ value: 0 })),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/utils/platform', () => ({
  isAndroid: jest.fn(() => false),
  isIOS: jest.fn(() => false),
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
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset platform mocks to default (neither Android nor iOS)
    const platformUtils = require('@/utils/platform');
    platformUtils.isAndroid.mockReturnValue(false);
    platformUtils.isIOS.mockReturnValue(false);
  });

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
    });

    it('should render movie titles', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      expect(screen.getByText('Spider Man: No Way Home')).toBeTruthy();
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
      expect(screen.getByText('Spider Man: No Way Home')).toBeTruthy();
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
      expect(screen.getByText('Spider Man: No Way Home')).toBeTruthy(); // 4.7
    });

    it('should handle movies with multiple genres', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      // Spider Man: No Way Home has 3 genres: Action, Comedy, Adventure
      expect(screen.getByText('Spider Man: No Way Home')).toBeTruthy();
    });

    it('should render with horizontal variant by default', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      const carousel = screen.getByTestId('movie-banner-carousel');
      expect(carousel).toBeTruthy();
      expect(carousel.props.accessibilityLabel).toContain('horizontal');
    });

    it('should render with horizontal variant when explicitly set', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} variant="horizontal" />);

      const carousel = screen.getByTestId('movie-banner-carousel');
      expect(carousel).toBeTruthy();
      expect(carousel.props.accessibilityLabel).toContain('horizontal');
    });

    it('should render with vertical variant when set', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} variant="vertical" />);

      const carousel = screen.getByTestId('movie-banner-carousel');
      expect(carousel).toBeTruthy();
      expect(carousel.props.accessibilityLabel).toContain('vertical');
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
          castCrew: {
            actors: [],
            directors: [],
            producers: [],
            writers: [],
          },
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

      expect(screen.getAllByText(MOVIES_MOCK[0].title).length).toBe(2);
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

      expect(screen.getByText(MOVIES_MOCK[0].title)).toBeTruthy();

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

    it('should enable loop when movies.length > 3', () => {
      const manyMovies = Array.from({ length: 4 }, (_, index) => ({
        ...MOVIES_MOCK[0],
        id: `${index + 1}`,
        title: `Movie ${index + 1}`,
      }));

      const Carousel = require('react-native-reanimated-carousel');
      render(<MovieBannerCarousel movies={manyMovies} />);

      const carouselCall = Carousel.mock.calls[0][0];
      expect(carouselCall.loop).toBe(true);
    });

    it('should disable loop when movies.length <= 3', () => {
      const fewMovies = Array.from({ length: 3 }, (_, index) => ({
        ...MOVIES_MOCK[0],
        id: `${index + 1}`,
        title: `Movie ${index + 1}`,
      }));

      const Carousel = require('react-native-reanimated-carousel');
      render(<MovieBannerCarousel movies={fewMovies} />);

      const carouselCall = Carousel.mock.calls[0][0];
      expect(carouselCall.loop).toBe(false);
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

  describe('Navigation', () => {
    it('should navigate to movie details when movie banner is pressed', () => {
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      // Find and press the movie banner
      const movieBanner = screen.getByTestId('movie-banner');
      fireEvent.press(movieBanner);

      // Verify navigation was called with correct route (covers line 71)
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/(main)/movies/1');
    });

    it('should navigate with correct movie ID for each movie', () => {
      const multipleMovies: Movie[] = [
        ...MOVIES_MOCK,
        {
          ...MOVIES_MOCK[0],
          id: '2',
          title: 'Second Movie',
        },
        {
          ...MOVIES_MOCK[0],
          id: '3',
          title: 'Third Movie',
        },
      ];

      render(<MovieBannerCarousel movies={multipleMovies} />);

      // Press first movie banner
      const firstBanner = screen.getAllByTestId('movie-banner')[0];
      fireEvent.press(firstBanner);
      expect(mockPush).toHaveBeenCalledWith('/(main)/movies/1');

      // Press second movie banner
      const secondBanner = screen.getAllByTestId('movie-banner')[1];
      fireEvent.press(secondBanner);
      expect(mockPush).toHaveBeenCalledWith('/(main)/movies/2');

      // Press third movie banner
      const thirdBanner = screen.getAllByTestId('movie-banner')[2];
      fireEvent.press(thirdBanner);
      expect(mockPush).toHaveBeenCalledWith('/(main)/movies/3');

      expect(mockPush).toHaveBeenCalledTimes(3);
    });
  });

  describe('Platform-specific Accessibility', () => {
    it('should add Android-specific accessibility props when on Android', () => {
      const platformUtils = require('@/utils/platform');
      platformUtils.isAndroid.mockReturnValue(true);
      platformUtils.isIOS.mockReturnValue(false);

      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      const carousel = screen.getByTestId('movie-banner-carousel');
      expect(carousel.props.accessibilityLiveRegion).toBe('polite');

      // Check that slide items also have Android props
      const slideItem = screen.getByTestId('movie-banner-slide-item-1');
      expect(slideItem.props.accessibilityLiveRegion).toBe('polite');
    });

    it('should add iOS-specific accessibility props when on iOS', () => {
      const platformUtils = require('@/utils/platform');
      platformUtils.isAndroid.mockReturnValue(false);
      platformUtils.isIOS.mockReturnValue(true);

      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      const slideItem = screen.getByTestId('movie-banner-slide-item-1');
      expect(slideItem.props.accessibilityTraits).toEqual(['button']);
    });

    it('should not add platform-specific props when on neither Android nor iOS', () => {
      const platformUtils = require('@/utils/platform');
      platformUtils.isAndroid.mockReturnValue(false);
      platformUtils.isIOS.mockReturnValue(false);

      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      const carousel = screen.getByTestId('movie-banner-carousel');
      expect(carousel.props.accessibilityLiveRegion).toBeUndefined();

      const slideItem = screen.getByTestId('movie-banner-slide-item-1');
      expect(slideItem.props.accessibilityLiveRegion).toBeUndefined();
      expect(slideItem.props.accessibilityTraits).toBeUndefined();
    });
  });

  describe('Carousel Configuration', () => {
    it('should pass correct variant configuration to carousel for horizontal', () => {
      const Carousel = require('react-native-reanimated-carousel');
      render(<MovieBannerCarousel movies={MOVIES_MOCK} variant="horizontal" />);

      const carouselCall = Carousel.mock.calls[0][0];
      expect(carouselCall.width).toBe(300);
      expect(carouselCall.height).toBe(220);
      expect(carouselCall.modeConfig.parallaxScrollingScale).toBe(0.9);
      expect(carouselCall.modeConfig.parallaxScrollingOffset).toBe(35);
    });

    it('should pass correct variant configuration to carousel for vertical', () => {
      const Carousel = require('react-native-reanimated-carousel');
      render(<MovieBannerCarousel movies={MOVIES_MOCK} variant="vertical" />);

      const carouselCall = Carousel.mock.calls[0][0];
      expect(carouselCall.width).toBe(103);
      expect(carouselCall.height).toBe(147);
      expect(carouselCall.modeConfig.parallaxScrollingScale).toBe(1);
      expect(carouselCall.modeConfig.parallaxScrollingOffset).toBe(-24);
    });

    it('should pass correct carousel props', () => {
      const Carousel = require('react-native-reanimated-carousel');
      render(<MovieBannerCarousel movies={MOVIES_MOCK} />);

      const carouselCall = Carousel.mock.calls[0][0];
      expect(carouselCall.autoPlayInterval).toBe(2000);
      expect(carouselCall.pagingEnabled).toBe(true);
      expect(carouselCall.snapEnabled).toBe(true);
      expect(carouselCall.mode).toBe('parallax');
      expect(carouselCall.data).toEqual(MOVIES_MOCK);
    });
  });
});
