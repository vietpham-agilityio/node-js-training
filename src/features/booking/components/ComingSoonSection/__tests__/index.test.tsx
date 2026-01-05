import { Movie } from '@/features/booking/types/movie';
import { render, screen } from '@testing-library/react-native';
import { ComingSoonSection } from '../index';

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

describe('ComingSoonSection', () => {
  const mockMovies = [
    { id: '1', title: 'Movie 1' },
    { id: '2', title: 'Movie 2' },
    { id: '3', title: 'Movie 3' },
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
    render(<ComingSoonSection {...defaultProps} />);

    expect(screen.getByText('Coming Soon')).toBeTruthy();
  });

  describe('Loading states', () => {
    it('should show skeleton when isLoading is true', () => {
      render(<ComingSoonSection {...defaultProps} isLoading={true} />);

      const skeleton = screen.getByTestId('movie-banner-carousel-skeleton');
      expect(skeleton).toBeTruthy();
    });

    it('should show skeleton when isRefetching is true', () => {
      render(<ComingSoonSection {...defaultProps} isRefetching={true} />);

      expect(screen.getByTestId('movie-banner-carousel-skeleton')).toBeTruthy();
    });

    it('should show skeleton when isFetchingNext is true', () => {
      render(<ComingSoonSection {...defaultProps} isFetchingNext={true} />);

      expect(screen.getByTestId('movie-banner-carousel-skeleton')).toBeTruthy();
    });
  });

  describe('Movies display', () => {
    it('should render MovieBannerCarousel with vertical variant', () => {
      render(<ComingSoonSection {...defaultProps} />);

      expect(screen.getByTestId('movie-banner-carousel')).toBeTruthy();
      expect(
        screen.getByLabelText('Movie carousel with 3 movies, vertical layout'),
      ).toBeTruthy();
    });

    it('should pass correct props to MovieBannerCarousel', () => {
      const onReachEnd = jest.fn();
      const { getByTestId } = render(
        <ComingSoonSection
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
      render(<ComingSoonSection {...defaultProps} movies={[]} />);

      expect(
        screen.getByText('No upcoming movies in this category'),
      ).toBeTruthy();
    });

    it('should not show MovieBannerCarousel when movies are empty', () => {
      render(<ComingSoonSection {...defaultProps} movies={[]} />);

      expect(screen.queryByTestId('movie-banner-carousel')).toBeNull();
    });
  });

  describe('Memoization', () => {
    it('should not re-render when props do not change', () => {
      const { rerender } = render(<ComingSoonSection {...defaultProps} />);

      // Re-render with same props
      rerender(<ComingSoonSection {...defaultProps} />);

      expect(screen.getByText('Coming Soon')).toBeTruthy();
    });

    it('should re-render when movies change', () => {
      const { rerender } = render(<ComingSoonSection {...defaultProps} />);

      const newMovies = [{ id: '4', title: 'Movie 4' }] as Movie[];

      rerender(<ComingSoonSection {...defaultProps} movies={newMovies} />);

      expect(
        screen.getByLabelText('Movie carousel with 1 movies, vertical layout'),
      ).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role for header', () => {
      const { getByRole } = render(<ComingSoonSection {...defaultProps} />);

      expect(getByRole('header')).toBeTruthy();
    });
  });

  describe('Empty state styling', () => {
    it('should render empty state with correct height', () => {
      const { getByText } = render(
        <ComingSoonSection {...defaultProps} movies={[]} />,
      );

      const emptyMessage = getByText('No upcoming movies in this category');
      expect(emptyMessage).toBeTruthy();
    });
  });
});
