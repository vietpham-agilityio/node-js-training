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
      {
        id: '1',
        title: 'Movie 1',
        rating: 4.5,
        posterUrl: 'https://example.com/1.jpg',
      },
      {
        id: '2',
        title: 'Movie 2',
        rating: 3.8,
        posterUrl: 'https://example.com/2.jpg',
      },
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
  useMoviesInfinite: () => ({
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
  useSearchMovies: () => ({
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
  useDebounce: (value: string) => mockDebouncedValue || value,
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
          {
            id: '1',
            title: 'Movie 1',
            rating: 4.5,
            posterUrl: 'https://example.com/1.jpg',
          },
          {
            id: '2',
            title: 'Movie 2',
            rating: 3.8,
            posterUrl: 'https://example.com/2.jpg',
          },
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
      expect(getByTestId('search-input')).toBeTruthy();
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
      expect(getByTestId('tabs-container')).toBeTruthy();
    });

    it('should render horizontal cards', () => {
      const { getAllByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      expect(getAllByTestId('horizontal-card').length).toBe(2);
    });
  });

  describe('Search Functionality', () => {
    it('should update search query when input changes', () => {
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      const searchInput = getByTestId('search-input-input');
      fireEvent.changeText(searchInput, 'test query');

      expect(searchInput.props.value).toBe('test query');
    });

    it('should show clear button when search query has text', () => {
      const { getByTestId, queryByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      const searchInput = getByTestId('search-input-input');

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
      const searchInput = getByTestId('search-input-input');

      // Type in search
      fireEvent.changeText(searchInput, 'test');

      // Press clear button
      const clearButton = getByTestId('clear-search-button');
      fireEvent.press(clearButton);

      // Search should be cleared
      expect(searchInput.props.value).toBe('');
    });
  });

  describe('Movie Display', () => {
    it('should display all movies when no search query', () => {
      const { getAllByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      expect(getAllByTestId('horizontal-card').length).toBe(2);
    });

    it('should display search results when search query is active', () => {
      mockSearchResults = [
        {
          id: '3',
          title: 'Search Movie 1',
          rating: 4.0,
          posterUrl: 'https://example.com/3.jpg',
        },
        {
          id: '4',
          title: 'Search Movie 2',
          rating: 3.5,
          posterUrl: 'https://example.com/4.jpg',
        },
      ];
      mockDebouncedValue = 'test';

      const { getAllByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      // Should show search results
      expect(getAllByTestId('horizontal-card').length).toBe(2);
    });

    it('should navigate to movie details when card is pressed', () => {
      const { getAllByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });
      const horizontalCards = getAllByTestId('horizontal-card');
      fireEvent.press(horizontalCards[0]);

      expect(mockPush).toHaveBeenCalledWith('/(main)/movies/1');
    });
  });

  describe('Rating Filter', () => {
    it('should filter movies by rating', () => {
      const { getByTestId, getAllByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      // Select 4+ rating filter
      const highRatingTab = getByTestId('tab-4+');
      fireEvent.press(highRatingTab);

      // Only Movie 1 with rating >= 4 should be shown
      expect(getAllByTestId('horizontal-card').length).toBe(1);
    });

    it('should show all movies when "All" rating is selected', () => {
      const { getByTestId, getAllByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      const allTab = getByTestId('tab-all');
      fireEvent.press(allTab);

      // All movies should be shown
      expect(getAllByTestId('horizontal-card').length).toBe(2);
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
      mockSearchResults = [
        {
          id: '3',
          title: 'Search Movie 1',
          rating: 4.0,
          posterUrl: 'https://example.com/3.jpg',
        },
      ];
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
      const highRatingTab = getByTestId('tab-4+');
      fireEvent.press(highRatingTab);

      expect(getByText(/with 4\+/)).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator when loading all movies', () => {
      mockIsLoadingAllMovies = true;
      mockAllMoviesData = { pages: [] };
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByTestId('empty-loading')).toBeTruthy();
    });

    it('should show loading indicator when searching', () => {
      mockIsSearching = true;
      mockDebouncedValue = 'test';
      mockSearchResults = [];
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByTestId('empty-loading')).toBeTruthy();
    });

    it('should show footer loading when fetching next page', () => {
      mockIsFetchingNextAllMovies = true;
      mockHasNextAllMovies = true;
      mockDebouncedValue = '';
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByTestId('footer-loading')).toBeTruthy();
    });
  });

  describe('Empty States', () => {
    it('should show search placeholder when no search query', () => {
      mockAllMoviesData = { pages: [] };
      const { getByPlaceholderText } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByPlaceholderText('Search movies...')).toBeTruthy();
    });

    it('should show "No movies found" when search returns no results', () => {
      mockSearchResults = [];
      mockDebouncedValue = 'test';
      const { getByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByTestId('empty-no-results')).toBeTruthy();
    });

    it('should not show empty states when there are movies', () => {
      mockAllMoviesData = {
        pages: [
          [
            {
              id: '1',
              title: 'Movie 1',
              rating: 4.5,
              posterUrl: 'https://example.com/1.jpg',
            },
          ],
        ],
      };
      mockDebouncedValue = '';
      const { queryByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(queryByTestId('empty-loading')).toBeNull();
      expect(queryByTestId('empty-no-results')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle movies without rating', () => {
      mockAllMoviesData = {
        pages: [
          [
            {
              id: '1',
              title: 'Movie 1',
              posterUrl: 'https://example.com/1.jpg',
            },
          ],
        ],
      };
      const { getAllByTestId } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getAllByTestId('horizontal-card').length).toBe(1);
    });

    it('should handle empty pages array', () => {
      mockAllMoviesData = { pages: [] };
      const { getByPlaceholderText } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByPlaceholderText('Search movies...')).toBeTruthy();
    });

    it('should handle plural/singular in results count', () => {
      mockAllMoviesData = {
        pages: [
          [
            {
              id: '1',
              title: 'Movie 1',
              rating: 4.5,
              posterUrl: 'https://example.com/1.jpg',
            },
          ],
        ],
      };
      const { getByText } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByText(/Showing 1 movie$/)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label on search input', () => {
      const { getByLabelText } = render(<SearchScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByLabelText('Search movies input')).toBeTruthy();
    });
  });
});
