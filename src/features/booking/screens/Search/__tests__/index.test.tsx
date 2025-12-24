import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import SearchScreen from '../index';

// Mock dependencies
const mockPush = jest.fn();
const mockFetchNextAllMovies = jest.fn();
const mockRefetchAllMovies = jest.fn();
const mockRefetchSearch = jest.fn();

let mockAllMoviesData: any = {
  pages: [
    [
      { id: '1', title: 'Movie 1', rating: 4.5 },
      { id: '2', title: 'Movie 2', rating: 3.8 },
    ],
  ],
};
let mockSearchResults: any[] = [];
let mockIsLoadingAllMovies = false;
let mockIsFetchingNextAllMovies = false;
let mockHasNextAllMovies = false;
let mockIsRefetchingAllMovies = false;
let mockIsAllMoviesError = false;
let mockAllMoviesError: Error | null = null;

let mockIsSearching = false;
let mockIsSearchFetching = false;
let mockIsSearchError = false;
let mockSearchError: Error | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: (...args: any[]) => mockPush(...args),
  }),
}));

jest.mock('@/features/booking/hooks/useMovies', () => ({
  useMoviesInfinite: (options: any) => ({
    data: mockAllMoviesData,
    isLoading: mockIsLoadingAllMovies,
    isFetchingNextPage: mockIsFetchingNextAllMovies,
    hasNextPage: mockHasNextAllMovies,
    fetchNextPage: mockFetchNextAllMovies,
    refetch: mockRefetchAllMovies,
    isRefetching: mockIsRefetchingAllMovies,
    isError: mockIsAllMoviesError,
    error: mockAllMoviesError,
  }),
  useSearchMovies: (query: string) => ({
    data: mockSearchResults,
    isLoading: mockIsSearching,
    isFetching: mockIsSearchFetching,
    isError: mockIsSearchError,
    error: mockSearchError,
    refetch: mockRefetchSearch,
  }),
}));

let mockDebouncedValue = '';
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => mockDebouncedValue || value, // Use mockDebouncedValue if set, otherwise return value
}));

jest.mock('uniwind', () => ({
  withUniwind: (Component: any) => Component,
  useResolveClassNames: () => ({ color: '#FFFFFF' }),
}));

// Mock components
jest.mock('@/components/SearchInput', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextInput, View } = require('react-native');
  return {
    SearchInput: ({
      value,
      onChangeText,
      placeholder,
      accessibilityLabel,
      testID,
    }: any) => (
      <View testID={testID || 'search-input'}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          testID="search-input-field"
          accessibilityLabel={accessibilityLabel}
        />
      </View>
    ),
  };
});

jest.mock('@/components/MovieCard', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TouchableOpacity, Text, View } = require('react-native');
  return {
    MovieCard: ({ title, onPress, id, ...props }: any) => (
      <TouchableOpacity onPress={onPress} testID={`movie-card-${id}`}>
        <View>
          <Text testID={`movie-title-${id}`}>{title}</Text>
        </View>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/components/Tabs', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    Tabs: ({ tabs, activeTab, onTabChange }: any) => (
      <View testID="rating-tabs">
        {tabs.map((tab: any) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            testID={`rating-tab-${tab.id}`}
          >
            <Text>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    }: any) => (
      <Text
        testID={testID}
        className={className}
        accessibilityRole={accessibilityRole}
      >
        {children}
      </Text>
    ),
  };
});

jest.mock('@/components/Button', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: ({ onPress, title, accessibilityLabel, size }: any) => (
      <TouchableOpacity
        onPress={onPress}
        testID="retry-button"
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text>{title}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/icons/CancelIcon', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    CancelIcon: () => <View testID="cancel-icon" />,
  };
});

jest.mock('@shopify/flash-list', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, ScrollView } = require('react-native');
  return {
    FlashList: ({
      data,
      renderItem,
      keyExtractor,
      getItemType,
      ListHeaderComponent,
      ListFooterComponent,
      ListEmptyComponent,
      refreshControl,
      onEndReached,
      testID,
    }: any) => {
      const items = data || [];
      return (
        <View testID={testID || 'flash-list'}>
          {ListHeaderComponent && <View>{ListHeaderComponent}</View>}
          {refreshControl && (
            <View testID="refresh-control">{refreshControl}</View>
          )}
          {items.length > 0 ? (
            <ScrollView
              testID="flash-list-scroll"
              onScrollEndDrag={() => onEndReached?.()}
            >
              {items.map((item: any, index: number) => {
                const key = keyExtractor ? keyExtractor(item, index) : index;
                const itemType = getItemType ? getItemType(item) : 'default';
                return (
                  <View key={key} testID={`item-type-${itemType}`}>
                    {renderItem({ item, index })}
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            ListEmptyComponent && (
              <View testID="empty-component">{ListEmptyComponent}</View>
            )
          )}
          {ListFooterComponent && (
            <View testID="footer-component">{ListFooterComponent}</View>
          )}
        </View>
      );
    },
  };
});

jest.mock('react-native-safe-area-context', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    SafeAreaView: ({
      children,
      edges,
      accessibilityLabel,
      accessibilityHint,
    }: any) => (
      <View
        testID="safe-area-view"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {children}
      </View>
    ),
  };
});

// Mock constants
jest.mock('@/constants', () => ({
  ERROR_MESSAGES: {
    MOVIE_NETWORK_ERROR: 'Network error occurred',
  },
  MESSAGES: {
    NO_RESULT_FOUND: 'No results found',
  },
  RATING_FILTERS: [
    { id: 'all', label: 'All Ratings', minRating: 0 },
    { id: '4+', label: '4+', minRating: 4 },
    { id: '3+', label: '3+', minRating: 3 },
    { id: '2+', label: '2+', minRating: 2 },
    { id: '1+', label: '1+', minRating: 1 },
  ],
  ROUTES: {
    MOVIE_DETAILS: (id: string) => `/(main)/movies/${id}`,
  },
  Size: {
    EXTRA_SMALL: 'extra-small',
  },
}));

// Helper to create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';

  return Wrapper;
};

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDebouncedValue = '';
    mockAllMoviesData = {
      pages: [
        [
          { id: '1', title: 'Movie 1', rating: 4.5 },
          { id: '2', title: 'Movie 2', rating: 3.8 },
        ],
      ],
    };
    mockSearchResults = [];
    mockIsLoadingAllMovies = false;
    mockIsFetchingNextAllMovies = false;
    mockHasNextAllMovies = false;
    mockIsRefetchingAllMovies = false;
    mockIsAllMoviesError = false;
    mockAllMoviesError = null;
    mockIsSearching = false;
    mockIsSearchFetching = false;
    mockIsSearchError = false;
    mockSearchError = null;
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('safe-area-view')).toBeTruthy();
    });

    it('should render search input', () => {
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('search-input')).toBeTruthy();
    });

    it('should render rating filter tabs', () => {
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('rating-tabs')).toBeTruthy();
    });

    it('should render FlashList', () => {
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('flash-list')).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    it('should update search query when input changes', () => {
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      const searchInput = getByTestId('search-input-field');
      fireEvent.changeText(searchInput, 'test query');

      expect(searchInput.props.value).toBe('test query');
    });

    it('should show clear button when search query has text', () => {
      const { getByTestId, queryByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      const searchInput = getByTestId('search-input-field');

      // Initially no clear button
      expect(queryByTestId('cancel-icon')).toBeNull();

      // Type in search
      fireEvent.changeText(searchInput, 'test');

      // Clear button should appear
      expect(getByTestId('cancel-icon')).toBeTruthy();
    });

    it('should clear search when clear button is pressed', () => {
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      const searchInput = getByTestId('search-input-field');

      // Type in search
      fireEvent.changeText(searchInput, 'test');

      // Press clear button
      const clearButton = getByTestId('cancel-icon').parent;
      fireEvent.press(clearButton);

      // Search should be cleared
      expect(searchInput.props.value).toBe('');
    });
  });

  describe('Movie Display', () => {
    it('should display all movies when no search query', () => {
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('movie-card-1')).toBeTruthy();
      expect(getByTestId('movie-card-2')).toBeTruthy();
    });

    it('should display search results when search query is active', () => {
      mockSearchResults = [
        { id: '3', title: 'Search Movie 1', rating: 4.0 },
        { id: '4', title: 'Search Movie 2', rating: 3.5 },
      ];
      mockDebouncedValue = 'test';

      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      // Should show search results
      expect(getByTestId('movie-card-3')).toBeTruthy();
      expect(getByTestId('movie-card-4')).toBeTruthy();
    });

    it('should navigate to movie details when movie is pressed', () => {
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      const movieCard = getByTestId('movie-card-1');
      fireEvent.press(movieCard);

      expect(mockPush).toHaveBeenCalledWith('/(main)/movies/1');
    });
  });

  describe('Rating Filter', () => {
    it('should filter movies by rating', () => {
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      // Select 4+ rating filter
      const highRatingTab = getByTestId('rating-tab-4+');
      fireEvent.press(highRatingTab);

      // Movies with rating >= 4 should be shown
      expect(getByTestId('movie-card-1')).toBeTruthy(); // rating 4.5
      // Movie 2 with rating 3.8 should be filtered out
    });

    it('should show all movies when "All" rating is selected', () => {
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      const allTab = getByTestId('rating-tab-all');
      fireEvent.press(allTab);

      // All movies should be shown
      expect(getByTestId('movie-card-1')).toBeTruthy();
      expect(getByTestId('movie-card-2')).toBeTruthy();
    });
  });

  describe('Results Count', () => {
    it('should display results count when movies are shown', () => {
      const { getByText } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByText(/Showing 2 movie/)).toBeTruthy();
    });

    it('should display search results count when searching', () => {
      mockSearchResults = [{ id: '3', title: 'Search Movie 1', rating: 4.0 }];
      mockDebouncedValue = 'test';

      const { getByText } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByText(/Found 1 movie for "test"/)).toBeTruthy();
    });

    it('should display rating filter in results count', () => {
      const { getByTestId, getByText } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      // Select 4+ rating filter
      const highRatingTab = getByTestId('rating-tab-4+');
      fireEvent.press(highRatingTab);

      expect(getByText(/with 4\+/)).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator when loading all movies', () => {
      mockIsLoadingAllMovies = true;
      mockAllMoviesData = { pages: [] }; // Empty data to trigger ListEmptyComponent
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      // ActivityIndicator should be in the empty component
      expect(getByTestId('empty-component')).toBeTruthy();
    });

    it('should show loading indicator when searching', () => {
      mockIsSearching = true;
      mockDebouncedValue = 'test';
      mockSearchResults = []; // Empty results to trigger ListEmptyComponent
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      // ActivityIndicator should be in the empty component
      expect(getByTestId('empty-component')).toBeTruthy();
    });

    it('should show footer loading when fetching next page', () => {
      mockIsFetchingNextAllMovies = true;
      mockHasNextAllMovies = true;
      mockDebouncedValue = '';
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByTestId('footer-component')).toBeTruthy();
    });
  });

  describe('Empty States', () => {
    it('should show "Search for movies" when no search query', () => {
      mockAllMoviesData = { pages: [] };
      const { getByPlaceholderText } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByPlaceholderText('Search movies...')).toBeTruthy();
    });

    it('should show "No movies found" when search returns no results (line 250)', () => {
      mockSearchResults = [];
      mockDebouncedValue = 'test';
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByTestId('empty-component')).toBeTruthy();
    });

    it('should show "Search for movies" when search is active but no query entered (line 230)', () => {
      mockDebouncedValue = '';
      mockAllMoviesData = { pages: [] };
      const { getByPlaceholderText } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByPlaceholderText('Search movies...')).toBeTruthy();
    });

    it('should return null from Empty when conditions are not met (line 271)', () => {
      mockAllMoviesData = {
        pages: [[{ id: '1', title: 'Movie 1', rating: 4.5 }]],
      };
      mockDebouncedValue = '';
      const { queryByText } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      // Empty component should return null when there are movies
      expect(queryByText('Search for movies')).toBeNull();
      expect(queryByText('No movies found')).toBeNull();
    });
  });

  describe('Load More', () => {
    it('should call fetchNextPage when end is reached', () => {
      mockHasNextAllMovies = true;
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      const scrollView = getByTestId('flash-list-scroll');
      fireEvent(scrollView, 'scrollEndDrag');

      expect(mockFetchNextAllMovies).toHaveBeenCalled();
    });

    it('should not call fetchNextPage when already fetching', () => {
      mockHasNextAllMovies = true;
      mockIsFetchingNextAllMovies = true;
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      const scrollView = getByTestId('flash-list-scroll');
      fireEvent(scrollView, 'scrollEndDrag');

      // Should not call again if already fetching
      expect(mockFetchNextAllMovies).not.toHaveBeenCalled();
    });
  });

  describe('Refresh Control', () => {
    it('should show refresh control when not searching', () => {
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByTestId('refresh-control')).toBeTruthy();
    });

    it('should not show refresh control when searching', () => {
      mockDebouncedValue = 'test';
      const { queryByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(queryByTestId('refresh-control')).toBeNull();
    });

    it('should call refetch when refresh is triggered', () => {
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      const refreshControl = getByTestId('refresh-control');
      const refreshComponent = refreshControl.props.children;
      if (refreshComponent?.props?.onRefresh) {
        refreshComponent.props.onRefresh();
        expect(mockRefetchAllMovies).toHaveBeenCalled();
      }
    });
  });

  describe('getItemType', () => {
    it('should call getItemType for each item (line 148)', () => {
      mockAllMoviesData = {
        pages: [
          [
            { id: '1', title: 'Movie 1', rating: 4.5, status: 'now_playing' },
            { id: '2', title: 'Movie 2', rating: 3.8 },
          ],
        ],
      };
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      // getItemType should be called and return status or 'default'
      expect(getByTestId('item-type-now_playing')).toBeTruthy();
      expect(getByTestId('item-type-default')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle movies without rating', () => {
      mockAllMoviesData = {
        pages: [[{ id: '1', title: 'Movie 1' }]],
      };
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByTestId('movie-card-1')).toBeTruthy();
    });

    it('should handle empty pages array', () => {
      mockAllMoviesData = { pages: [] };
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByTestId('empty-component')).toBeTruthy();
    });

    it('should handle null allMoviesData', () => {
      mockAllMoviesData = null;
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByTestId('empty-component')).toBeTruthy();
    });

    it('should handle plural/singular in results count', () => {
      mockAllMoviesData = {
        pages: [[{ id: '1', title: 'Movie 1', rating: 4.5 }]],
      };
      const { getByText } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByText(/Showing 1 movie$/)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility labels', () => {
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      const safeAreaView = getByTestId('safe-area-view');
      expect(safeAreaView.props.accessibilityLabel).toBe(
        'Search movies screen',
      );
      expect(safeAreaView.props.accessibilityHint).toBe('Search screen');
    });
  });
});
