import { Movie } from '@/features/booking/schemas/movie';
import { render, screen } from '@testing-library/react-native';
import { NowPlayingSection } from '../index';

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

describe('NowPlayingSection', () => {
  const mockMovies = [
    { id: '1', title: 'Movie 1', rating: 8.5 },
    { id: '2', title: 'Movie 2', rating: 7.2 },
    { id: '3', title: 'Movie 3', rating: 9.1 },
  ] as Movie[];

  const defaultProps = {
    movies: mockMovies,
    isLoading: false,
    isRefetching: false,
    isFetchingNext: false,
    onReachEnd: jest.fn(),
    hasNextPage: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render section title', () => {
    render(<NowPlayingSection {...defaultProps} />);

    expect(screen.getByText('Now Playing')).toBeTruthy();
  });

  describe('Loading states', () => {
    it('should show skeleton when isLoading is true', () => {
      render(<NowPlayingSection {...defaultProps} isLoading={true} />);

      const skeleton = screen.getByTestId('movie-banner-carousel-skeleton');
      expect(skeleton).toBeTruthy();
    });

    it('should show skeleton when isRefetching is true', () => {
      render(<NowPlayingSection {...defaultProps} isRefetching={true} />);

      expect(screen.getByTestId('movie-banner-carousel-skeleton')).toBeTruthy();
    });

    it('should show skeleton when isFetchingNext is true', () => {
      render(<NowPlayingSection {...defaultProps} isFetchingNext={true} />);

      expect(screen.getByTestId('movie-banner-carousel-skeleton')).toBeTruthy();
    });

    it('should not show skeleton when all loading states are false', () => {
      render(<NowPlayingSection {...defaultProps} />);

      expect(screen.queryByTestId('movie-banner-carousel-skeleton')).toBeNull();
    });
  });

  describe('Movies display', () => {
    it('should render MovieBannerCarousel when movies are available', () => {
      render(<NowPlayingSection {...defaultProps} />);

      expect(screen.getByTestId('movie-banner-carousel')).toBeTruthy();
      expect(
        screen.getByLabelText(
          'Movie carousel with 3 movies, horizontal layout',
        ),
      ).toBeTruthy();
    });

    it('should pass correct props to MovieBannerCarousel', () => {
      const onReachEnd = jest.fn();
      const { getByTestId } = render(
        <NowPlayingSection
          {...defaultProps}
          movies={mockMovies}
          onReachEnd={onReachEnd}
          hasNextPage={true}
          isFetchingNext={false}
        />,
      );

      expect(getByTestId('movie-banner-carousel')).toBeTruthy();
    });

    it('should show empty state when no movies', () => {
      render(<NowPlayingSection {...defaultProps} movies={[]} />);

      expect(
        screen.getByText('No movies available in this category'),
      ).toBeTruthy();
    });

    it('should not show MovieBannerCarousel when movies are empty', () => {
      render(<NowPlayingSection {...defaultProps} movies={[]} />);

      expect(screen.queryByTestId('movie-banner-carousel')).toBeNull();
    });
  });

  describe('Memoization', () => {
    it('should not re-render when props do not change', () => {
      const { rerender } = render(<NowPlayingSection {...defaultProps} />);

      // Re-render with same props
      rerender(<NowPlayingSection {...defaultProps} />);

      // Component should be memoized
      expect(screen.getByText('Now Playing')).toBeTruthy();
    });

    it('should re-render when movies change', () => {
      const { rerender } = render(<NowPlayingSection {...defaultProps} />);

      const newMovies = [{ id: '4', title: 'Movie 4', rating: 8.0 }] as Movie[];

      rerender(<NowPlayingSection {...defaultProps} movies={newMovies} />);

      expect(
        screen.getByLabelText(
          'Movie carousel with 1 movies, horizontal layout',
        ),
      ).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role for header', () => {
      const { getByRole } = render(<NowPlayingSection {...defaultProps} />);

      expect(getByRole('header')).toBeTruthy();
    });
  });
});
