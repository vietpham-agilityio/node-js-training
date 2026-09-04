import { Movie, MovieStatus } from '@/features/booking/schemas/movie';
import { render } from '@testing-library/react-native';
import { LinkProps } from 'expo-router';
import HomeScreen from '../index';
import { MOVIE_STATUS } from '@/constants/status';

// Mock dependencies
const mockPush = jest.fn();
const mockRefetchNowPlaying = jest.fn();
const mockRefetchComingSoon = jest.fn();
const mockFetchNextNowPlaying = jest.fn();
const mockFetchNextComingSoon = jest.fn();

let mockNowPlayingMovies: Movie[] = [];
let mockComingSoonMovies: Movie[] = [];
let mockIsLoadingNowPlaying = false;
let mockIsLoadingComingSoon = false;
let mockHasNextNowPlaying = false;
let mockHasNextComingSoon = false;
let mockGenres: { id: string; name: string }[] = [];

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  Link: ({ children }: LinkProps) => children,
}));

jest.mock('@/features/booking/hooks/useGenres', () => ({
  useGenres: () => ({ data: mockGenres }),
}));

jest.mock('@/features/booking/hooks/useMovieData', () => ({
  useMovieData: ({ status }: { status: MovieStatus }) =>
    status === 'now_playing'
      ? {
          movies: mockNowPlayingMovies,
          isLoading: mockIsLoadingNowPlaying,
          isFetchingNextPage: false,
          hasNextPage: mockHasNextNowPlaying,
          fetchNextPage: mockFetchNextNowPlaying,
          refetch: mockRefetchNowPlaying,
          isRefetching: false,
        }
      : {
          movies: mockComingSoonMovies,
          isLoading: mockIsLoadingComingSoon,
          isFetchingNextPage: false,
          hasNextPage: mockHasNextComingSoon,
          fetchNextPage: mockFetchNextComingSoon,
          refetch: mockRefetchComingSoon,
          isRefetching: false,
        },
}));

jest.mock('@/features/booking/components/MovieBannerCarousel', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require('react-native');
  return {
    MovieBannerCarousel: ({
      movies,
      testID,
    }: {
      movies: Movie[];
      testID?: string;
    }) =>
      React.createElement(
        View,
        { testID: testID || 'movie-banner-carousel' },
        movies?.map((movie: Movie) =>
          React.createElement(Text, { key: movie.id }, movie.title),
        ),
      ),
  };
});

jest.mock('@/features/booking/components/PromotionCard', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require('react-native');
  return {
    PromotionCard: ({ id, title }: { id: string; title?: string }) =>
      React.createElement(
        View,
        { testID: `promotion-card-${id}` },
        React.createElement(Text, null, title || `Promotion ${id}`),
      ),
  };
});

jest.mock('@/constants', () => ({
  ROUTES: { SEARCH: '/search', HOME: '/home' },
  Size: { EXTRA_SMALL: 'extra-small' },
  TABS_FOOTER_HEIGHT: 80,
}));

jest.mock('@/mocks', () => ({
  MOCK_PROMOTIONS: [
    { id: 'promo1', title: 'Promotion 1' },
    { id: 'promo2', title: 'Promotion 2' },
  ],
}));

const mockMovie: Movie = {
  id: '1',
  title: 'Spider Man: No Way Home',
  synopsis: 'Peter Parker is unmasked.',
  posterUrl: 'https://example.com/poster.jpg',
  rating: 4.7,
  durationMinutes: 112,
  genre: ['action', 'comedy'],
  language: 'EN',
  releaseDate: '2023-06-15',
  createdAt: '2023-06-15T12:34:56Z',
  updatedAt: '2023-06-15T12:34:56Z',
  status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
};

const mockMovies = [
  { ...mockMovie, id: '1' },
  { ...mockMovie, id: '2' },
  { ...mockMovie, id: '3' },
];

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNowPlayingMovies = mockMovies;
    mockComingSoonMovies = mockMovies;
    mockIsLoadingNowPlaying = false;
    mockIsLoadingComingSoon = false;
    mockHasNextNowPlaying = false;
    mockHasNextComingSoon = false;
    mockGenres = [
      { id: 'g1', name: 'Action' },
      { id: 'g2', name: 'Comedy' },
    ];
  });

  describe('Loading State', () => {
    it('shows a skeleton when coming soon is loading', () => {
      mockIsLoadingComingSoon = true;
      const { getAllByTestId } = render(<HomeScreen />);
      expect(getAllByTestId('movie-banner-carousel-skeleton')).toBeTruthy();
    });
  });

  describe('Rendering', () => {
    it('renders the category tabs', () => {
      const { getByTestId } = render(<HomeScreen />);
      expect(getByTestId('tabs-container')).toBeTruthy();
    });

    it('renders genre tabs from useGenres (plus "All")', () => {
      const { getByText } = render(<HomeScreen />);
      expect(getByText('All')).toBeTruthy();
      expect(getByText('Action')).toBeTruthy();
      expect(getByText('Comedy')).toBeTruthy();
    });

    it('renders the search input', () => {
      const { getByPlaceholderText } = render(<HomeScreen />);
      expect(getByPlaceholderText('Search movies')).toBeTruthy();
    });

    it('renders the Now Playing and Coming Soon sections', () => {
      const { getByText } = render(<HomeScreen />);
      expect(getByText('Now Playing')).toBeTruthy();
      expect(getByText('Coming Soon')).toBeTruthy();
    });

    it('renders the promotions', () => {
      const { getByText } = render(<HomeScreen />);
      expect(getByText('Promotions')).toBeTruthy();
      expect(getByText('Promotion 1')).toBeTruthy();
      expect(getByText('Promotion 2')).toBeTruthy();
    });
  });

  describe('Movie display', () => {
    it('shows the empty state when there are no coming soon movies', () => {
      mockComingSoonMovies = [];
      const { getByText } = render(<HomeScreen />);
      expect(getByText('No upcoming movies in this category')).toBeTruthy();
    });

    it('shows both empty states when there are no movies at all', () => {
      mockNowPlayingMovies = [];
      mockComingSoonMovies = [];
      const { getByText } = render(<HomeScreen />);
      expect(getByText('No movies available in this category')).toBeTruthy();
      expect(getByText('No upcoming movies in this category')).toBeTruthy();
    });

    it('renders the movie titles from the carousel', () => {
      const { getAllByText } = render(<HomeScreen />);
      expect(getAllByText('Spider Man: No Way Home').length).toBeGreaterThan(0);
    });
  });
});
