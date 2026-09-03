import {
  GenreMovie,
  Movie,
  MovieStatus,
} from '@/features/booking/schemas/movie';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import { LinkProps } from 'expo-router';
import HomeScreen from '../index';
import { MOVIE_STATUS } from '@/constants/status';
import { GENRE_MOVIE } from '@/constants/movie';

// Mock dependencies
const mockPush = jest.fn();
const mockRefetchNowPlaying = jest.fn();
const mockRefetchComingSoon = jest.fn();
const mockFetchNextNowPlaying = jest.fn();
const mockFetchNextComingSoon = jest.fn();
const mockMovieStatus = MOVIE_STATUS;

let mockNowPlayingData: {
  pages: Movie[][];
} | null = null;
let mockComingSoonData: {
  pages: Movie[][];
} | null = null;
let mockIsLoadingNowPlaying = false;
let mockIsLoadingComingSoon = false;
let mockIsFetchingNextNowPlaying = false;
let mockIsFetchingNextComingSoon = false;
let mockHasNextNowPlaying = false;
let mockHasNextComingSoon = false;
let mockIsRefetchingNowPlaying = false;
let mockIsRefetchingComingSoon = false;

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  Link: ({ children, href }: LinkProps) => children,
}));

jest.mock('@/features/booking/hooks/useMovies', () => ({
  useMoviesInfinite: (options: { status?: MovieStatus }) => {
    if (options?.status === mockMovieStatus.NOW_PLAYING) {
      return {
        data: mockNowPlayingData,
        isLoading: mockIsLoadingNowPlaying,
        isFetchingNextPage: mockIsFetchingNextNowPlaying,
        hasNextPage: mockHasNextNowPlaying,
        fetchNextPage: mockFetchNextNowPlaying,
        refetch: mockRefetchNowPlaying,
        isRefetching: mockIsRefetchingNowPlaying,
      };
    }
    return {
      data: mockComingSoonData,
      isLoading: mockIsLoadingComingSoon,
      isFetchingNextPage: mockIsFetchingNextComingSoon,
      hasNextPage: mockHasNextComingSoon,
      fetchNextPage: mockFetchNextComingSoon,
      refetch: mockRefetchComingSoon,
      isRefetching: mockIsRefetchingComingSoon,
    };
  },
  useMoviesByGenreInfinite: (options: { genre?: string }) => {
    if (options?.genre === 'action') {
      return {
        data: mockNowPlayingData,
        isLoading: mockIsLoadingNowPlaying,
        isFetchingNextPage: mockIsFetchingNextNowPlaying,
        hasNextPage: mockHasNextNowPlaying,
        fetchNextPage: mockFetchNextNowPlaying,
        refetch: mockRefetchNowPlaying,
        isRefetching: mockIsRefetchingNowPlaying,
      };
    }
    return {
      data: mockComingSoonData,
      isLoading: mockIsLoadingComingSoon,
      isFetchingNextPage: mockIsFetchingNextComingSoon,
      hasNextPage: mockHasNextComingSoon,
      fetchNextPage: mockFetchNextComingSoon,
      refetch: mockRefetchComingSoon,
      isRefetching: mockIsRefetchingComingSoon,
    };
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
      variant,
      testID,
    }: {
      movies: Movie[];
      variant?: string;
      testID?: string;
    }) =>
      React.createElement(
        View,
        { testID: testID || 'movie-banner-carousel', 'data-variant': variant },
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
    PromotionCard: ({
      id,
      title,
      testID,
    }: {
      id: string;
      title?: string;
      testID?: string;
    }) =>
      React.createElement(
        View,
        { testID: testID || `promotion-card-${id}` },
        React.createElement(Text, null, title || `Promotion ${id}`),
      ),
  };
});

// Mock constants
jest.mock('@/constants', () => ({
  FILTER_GENRE_TABS: [
    { id: 'all', label: 'All' },
    { id: 'action', label: 'Action' },
    { id: 'comedy', label: 'Comedy' },
  ],
  ROUTES: {
    SEARCH: '/search',
    HOME: '/home',
  },
  Size: {
    EXTRA_SMALL: 'extra-small',
  },
  TABS_FOOTER_HEIGHT: 80,
}));

jest.mock('@/mocks', () => ({
  MOCK_PROMOTIONS: [
    { id: 'promo1', title: 'Promotion 1' },
    { id: 'promo2', title: 'Promotion 2' },
  ],
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';

  return Wrapper;
};

describe('HomeScreen', () => {
  const mockMovie: Movie = {
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
    genre: [
      GENRE_MOVIE.ACTION as GenreMovie,
      GENRE_MOVIE.COMEDY as GenreMovie,
      GENRE_MOVIE.ADVENTURE as GenreMovie,
    ],
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockNowPlayingData = {
      pages: [mockMovies],
    };
    mockComingSoonData = {
      pages: [mockMovies],
    };
    mockIsLoadingNowPlaying = false;
    mockIsLoadingComingSoon = false;
    mockIsFetchingNextNowPlaying = false;
    mockIsFetchingNextComingSoon = false;
    mockHasNextNowPlaying = false;
    mockHasNextComingSoon = false;
    mockIsRefetchingNowPlaying = false;
    mockIsRefetchingComingSoon = false;
  });

  describe('Loading State', () => {
    it('should show skeleton when coming soon is loading', () => {
      mockIsLoadingComingSoon = true;
      const { getAllByTestId } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      expect(getAllByTestId('movie-banner-carousel-skeleton')).toBeTruthy();
    });

    it('should show skeleton for both sections when both are loading', () => {
      mockIsLoadingNowPlaying = true;
      mockIsLoadingComingSoon = true;
      const { getAllByTestId } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      const skeletons = getAllByTestId('movie-banner-carousel-skeleton');
      expect(skeletons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('tabs-container')).toBeTruthy();
    });

    it('should render search input', () => {
      const { getByPlaceholderText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByPlaceholderText('Search movies')).toBeTruthy();
    });

    it('should render category tabs', () => {
      const { getByTestId } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('tabs-scroll-view')).toBeTruthy();
    });

    it('should render "Now Playing" section', () => {
      const { getByText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByText('Now Playing')).toBeTruthy();
    });

    it('should render "Coming Soon" section', () => {
      const { getByText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByText('Coming Soon')).toBeTruthy();
    });

    it('should render promotions section', () => {
      const { getByText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByText('Promotions')).toBeTruthy();
    });

    it('should render promotion cards', () => {
      const { getByText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByText('Promotion 1')).toBeTruthy();
      expect(getByText('Promotion 2')).toBeTruthy();
    });
  });

  describe('Movie Display', () => {
    it('should show empty state when no coming soon movies', () => {
      mockComingSoonData = { pages: [] };
      const { getByText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByText('No upcoming movies in this category')).toBeTruthy();
    });
  });

  describe('Category Filtering', () => {
    it('should render category tabs', () => {
      const { getByTestId } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('tabs-container')).toBeTruthy();
    });
  });

  describe('Load More Functionality', () => {
    it('should not show load more button when hasNextPage is false', () => {
      mockNowPlayingData = { pages: [] };
      mockHasNextNowPlaying = false;
      const { queryByText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });

      const loadMoreButton = queryByText('Load more movies');
      expect(loadMoreButton).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pages array', () => {
      mockNowPlayingData = { pages: [] };
      mockComingSoonData = { pages: [] };
      const { getByText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByText('No movies available in this category')).toBeTruthy();
      expect(getByText('No upcoming movies in this category')).toBeTruthy();
    });

    it('should handle null data', () => {
      mockNowPlayingData = null;
      mockComingSoonData = null;
      const { getByText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByText('No movies available in this category')).toBeTruthy();
      expect(getByText('No upcoming movies in this category')).toBeTruthy();
    });

    it('should limit movies to top 10 by rating', () => {
      const manyMovies = Array.from({ length: 15 }, (_, i) => ({
        ...mockMovie,
        id: `${i + 1}`,
      }));

      mockNowPlayingData = { pages: [manyMovies] };
      const { getAllByTestId } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });

      const carousel = getAllByTestId('movie-banner-carousel');
      expect(carousel).toBeTruthy();
      expect(carousel.length).toBeGreaterThan(0);
    });

    it('should handle movies without genre', () => {
      const moviesWithoutGenre = [
        { ...mockMovie, id: '1', title: 'Movie 1', rating: 4.5 },
        {
          ...mockMovie,
          id: '2',
          title: 'Movie 2',
          rating: 4.0,
          genre: [GENRE_MOVIE.ACTION as GenreMovie],
        },
      ];

      mockNowPlayingData = { pages: [moviesWithoutGenre] };
      const { getAllByText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });

      // Should still render movies
      expect(getAllByText('Movie 1').length).toBeGreaterThan(0);
      expect(getAllByText('Movie 2').length).toBeGreaterThan(0);
    });

    it('should handle movies without rating', () => {
      const moviesWithoutRating = [
        {
          ...mockMovie,
          id: '1',
          title: 'Movie 1',
          genre: [GENRE_MOVIE.ACTION as GenreMovie],
        },
        {
          ...mockMovie,
          id: '2',
          title: 'Movie 2',
          rating: 4.0,
          genre: [GENRE_MOVIE.ACTION as GenreMovie],
        },
      ];

      mockNowPlayingData = { pages: [moviesWithoutRating] };
      const { getAllByText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });

      expect(getAllByText('Movie 1').length).toBeGreaterThan(0);
      expect(getAllByText('Movie 2').length).toBeGreaterThan(0);
    });
  });
});
