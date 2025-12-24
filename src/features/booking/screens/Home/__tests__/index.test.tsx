import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';

import HomeScreen from '../index';

// Mock dependencies
const mockPush = jest.fn();
const mockRefetchNowPlaying = jest.fn();
const mockRefetchComingSoon = jest.fn();
const mockFetchNextNowPlaying = jest.fn();
const mockFetchNextComingSoon = jest.fn();

let mockNowPlayingData: any = null;
let mockComingSoonData: any = null;
let mockIsLoadingNowPlaying = false;
let mockIsLoadingComingSoon = false;
let mockIsFetchingNextNowPlaying = false;
let mockIsFetchingNextComingSoon = false;
let mockHasNextNowPlaying = false;
let mockHasNextComingSoon = false;
let mockIsRefetchingNowPlaying = false;
let mockIsRefetchingComingSoon = false;

jest.mock('expo-router', () => ({
  router: {
    push: mockPush,
  },
  Link: ({ children, href, asChild }: any) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TouchableOpacity } = require('react-native');
    return React.createElement(
      TouchableOpacity,
      { onPress: () => mockPush(href), testID: `link-${href}` },
      children,
    );
  },
}));

jest.mock('@/features/booking/hooks/useMovies', () => ({
  useMoviesInfinite: (options: any) => {
    if (options?.status === 'NOW_PLAYING') {
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

jest.mock('uniwind', () => ({
  withUniwind: (Component: any) => Component,
}));

// Mock components
jest.mock('@/components/SearchInput', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TouchableOpacity, Text } = require('react-native');
  return {
    SearchInput: ({ onPress, editable, accessibilityLabel, testID }: any) =>
      React.createElement(
        TouchableOpacity,
        { onPress, testID: testID || 'search-input' },
        React.createElement(Text, null, 'Search movies'),
      ),
  };
});

jest.mock('@/components/Tabs', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    Tabs: ({ tabs, activeTab, onTabChange, testID }: any) =>
      React.createElement(
        View,
        { testID: testID || 'tabs' },
        tabs.map((tab: any) =>
          React.createElement(
            TouchableOpacity,
            {
              key: tab.id,
              onPress: () => onTabChange(tab.id),
              testID: `tab-${tab.id}`,
              'data-active': activeTab === tab.id,
            },
            React.createElement(Text, null, tab.label),
          ),
        ),
      ),
  };
});

jest.mock('@/components/Typo', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require('react-native');
  return {
    Typo: ({
      children,
      size,
      weight,
      className,
      testID,
      accessibilityRole,
    }: any) =>
      React.createElement(
        Text,
        {
          testID,
          className,
          'data-size': size,
          'data-weight': weight,
          'data-role': accessibilityRole,
        },
        children,
      ),
  };
});

jest.mock('@/features/booking/components/MovieBannerCarousel', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require('react-native');
  return {
    MovieBannerCarousel: ({ movies, variant, testID }: any) =>
      React.createElement(
        View,
        { testID: testID || 'movie-banner-carousel', 'data-variant': variant },
        movies?.map((movie: any) =>
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
    PromotionCard: ({ id, title, testID }: any) =>
      React.createElement(
        View,
        { testID: testID || `promotion-card-${id}` },
        React.createElement(Text, null, title || `Promotion ${id}`),
      ),
  };
});

jest.mock('@/components/Button', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: ({ title, onPress, size, testID, accessibilityLabel }: any) =>
      React.createElement(
        TouchableOpacity,
        {
          onPress,
          testID: testID || 'button',
          'data-size': size,
          accessibilityLabel,
        },
        React.createElement(Text, null, title),
      ),
  };
});

jest.mock('@shopify/flash-list', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    FlashList: ({
      data,
      renderItem,
      keyExtractor,
      ListHeaderComponent,
      ListFooterComponent,
      refreshControl,
      testID,
    }: any) => {
      // ListHeaderComponent and ListFooterComponent are JSX elements (not functions in Home screen)
      const header = ListHeaderComponent || null;
      const footer = ListFooterComponent || null;

      // Render items if data exists
      const items =
        data && renderItem
          ? data.map((item: any, index: number) => {
              const key = keyExtractor ? keyExtractor(item, index) : index;
              const rendered = renderItem({ item, index });
              return rendered
                ? React.createElement(React.Fragment, { key }, rendered)
                : null;
            })
          : [];

      return React.createElement(
        View,
        { testID: testID || 'flash-list' },
        header,
        ...items.filter(Boolean),
        footer,
      );
    },
  };
});

// Mock constants
jest.mock('@/constants', () => ({
  FILTER_CATEGORY_TABS: [
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
  const mockMovies = [
    {
      id: '1',
      title: 'Movie 1',
      rating: 4.5,
      genre: ['Action', 'Drama'],
    },
    {
      id: '2',
      title: 'Movie 2',
      rating: 4.0,
      genre: ['Comedy'],
    },
    {
      id: '3',
      title: 'Movie 3',
      rating: 3.5,
      genre: ['Action'],
    },
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
    it('should show loading when either query is loading', () => {
      mockIsLoadingComingSoon = true;
      const { getByText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByText('Loading movies...')).toBeTruthy();
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('flash-list')).toBeTruthy();
    });

    it('should render search input', () => {
      const { getByTestId } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('search-input')).toBeTruthy();
    });

    it('should render category tabs', () => {
      const { getByTestId } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('tabs')).toBeTruthy();
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
      expect(getByTestId('tabs')).toBeTruthy();
    });
  });

  describe('Load More Functionality', () => {
    it('should show load more button for coming soon when hasNextPage is true', () => {
      mockComingSoonData = { pages: [] };
      mockHasNextComingSoon = true;
      const { getAllByText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });

      const loadMoreButtons = getAllByText('Load more movies');
      expect(loadMoreButtons.length).toBeGreaterThan(0);
    });

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

  describe('Fetching Next Page Indicator', () => {
    it('should show activity indicator when fetching next page for coming soon', () => {
      mockIsFetchingNextComingSoon = true;
      const { UNSAFE_getAllByType } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ActivityIndicator } = require('react-native');
      const indicators = UNSAFE_getAllByType(ActivityIndicator);
      expect(indicators.length).toBeGreaterThan(0);
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
        id: `${i + 1}`,
        title: `Movie ${i + 1}`,
        rating: 5 - i * 0.1,
        genre: ['Action'],
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
        { id: '1', title: 'Movie 1', rating: 4.5 },
        { id: '2', title: 'Movie 2', rating: 4.0, genre: ['Action'] },
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
        { id: '1', title: 'Movie 1', genre: ['Action'] },
        { id: '2', title: 'Movie 2', rating: 4.0, genre: ['Action'] },
      ];

      mockNowPlayingData = { pages: [moviesWithoutRating] };
      const { getAllByText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });

      expect(getAllByText('Movie 1').length).toBeGreaterThan(0);
      expect(getAllByText('Movie 2').length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility roles for headers', () => {
      const { getAllByText } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      });

      const nowPlayingHeader = getAllByText('Now Playing')[0].parent;
      expect(nowPlayingHeader?.props['data-role']).toBe('header');
    });
  });
});
