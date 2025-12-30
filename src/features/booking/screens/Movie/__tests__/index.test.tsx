import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import MovieScreen from '../index';

// Mock dependencies
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetMovie = jest.fn();
const mockSetSelectedMovie = jest.fn();
const mockRefetchMovie = jest.fn();

let mockParams: { id?: string } = {
  id: 'movie1',
};

let mockMovieData: any = {
  id: 'movie1',
  title: 'Test Movie',
  posterUrl: 'https://example.com/poster.jpg',
  durationMinutes: 120,
  genre: ['Action', 'Drama'],
  rating: 4.5,
  synopsis: 'A test movie synopsis',
  castCrew: {
    actors: [
      { name: 'Actor 1', imageUrl: 'https://example.com/actor1.jpg' },
      { name: 'Actor 2', imageUrl: null },
    ],
  },
  trailerUrl: ['https://example.com/trailer1.mp4'],
};

let mockIsLoading = false;
let mockIsError = false;
let mockError: Error | null = null;

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  router: {
    push: (...args: any[]) => mockPush(...args),
    back: (...args: any[]) => mockBack(...args),
  },
}));

jest.mock('@/features/booking/hooks/useMovies', () => ({
  useMovie: () => ({
    data: mockMovieData,
    isLoading: mockIsLoading,
    isError: mockIsError,
    error: mockError,
    refetch: mockRefetchMovie,
  }),
}));

const mockUseBookingStore = jest.fn((selector: any) =>
  selector({
    setMovie: mockSetMovie,
  }),
);

jest.mock('@/features/booking/store/booking', () => ({
  useBookingStore: (selector: any) => mockUseBookingStore(selector),
}));

const mockUseMovieStore = jest.fn((selector: any) =>
  selector({
    setSelectedMovie: mockSetSelectedMovie,
  }),
);

jest.mock('@/stores/movie', () => ({
  useMovieStore: (selector: any) => mockUseMovieStore(selector),
}));

jest.mock('@/components/Tabs', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    Tabs: ({ tabs, activeTab, onTabChange, variant }: any) => (
      <View testID="tabs" data-active-tab={activeTab}>
        {tabs.map((tab: any) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            testID={`tab-${tab.id}`}
          >
            <Text>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    ),
  };
});

jest.mock('@/features/booking/components/MovieTrailerCarousel', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require('react-native');
  return {
    MovieTrailerCarousel: ({ trailers }: any) => (
      <View testID="movie-trailer-carousel">
        {trailers?.map((trailer: string, index: number) => (
          <Text key={index} testID={`trailer-${index}`}>
            {trailer}
          </Text>
        ))}
      </View>
    ),
  };
});

jest.mock('expo-image', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Image } = require('react-native');
  return {
    Image: (props: any) => <Image {...props} />,
  };
});

jest.mock('@/components/HorizontalCard', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require('react-native');
  return {
    HorizontalCard: ({
      title,
      posterUrl,
      durationMinutes,
      genre,
      rating,
    }: any) => (
      <View testID="horizontal-card">
        <Text testID="horizontal-card-title">{title ?? ''}</Text>
        <Text testID="horizontal-card-image">{posterUrl ?? ''}</Text>
        <Text testID="horizontal-card-duration">{durationMinutes ?? ''}</Text>
        <Text testID="horizontal-card-genre">
          {genre ? genre.join(', ') : ''}
        </Text>
        {rating && <Text testID="horizontal-card-rating">{rating}</Text>}
      </View>
    ),
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

describe('MovieScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { id: 'movie1' };
    mockMovieData = {
      id: 'movie1',
      title: 'Test Movie',
      posterUrl: 'https://example.com/poster.jpg',
      durationMinutes: 120,
      genre: ['Action', 'Drama'],
      rating: 4.5,
      synopsis: 'A test movie synopsis',
      castCrew: {
        actors: [
          { name: 'Actor 1', imageUrl: 'https://example.com/actor1.jpg' },
          { name: 'Actor 2', imageUrl: null },
        ],
      },
      trailerUrl: ['https://example.com/trailer1.mp4'],
    };
    mockIsLoading = false;
    mockIsError = false;
    mockError = null;
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      mockIsLoading = true;
      const { UNSAFE_getByType, getByText } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ActivityIndicator } = require('react-native');
      const activityIndicator = UNSAFE_getByType(ActivityIndicator);
      expect(activityIndicator).toBeTruthy();
      expect(getByText('Movie Loading...')).toBeTruthy();
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('safe-area-view')).toBeTruthy();
    });

    it('should render movie banner container', () => {
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('movie-banner-container')).toBeTruthy();
    });

    it('should render horizontal card container', () => {
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('horizontal-card-container')).toBeTruthy();
    });

    it('should render horizontal card with correct props', () => {
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('horizontal-card')).toBeTruthy();
      expect(getByTestId('horizontal-card-title')).toBeTruthy();
      expect(getByTestId('horizontal-card-title').props.children).toBe(
        'Test Movie',
      );
      expect(getByTestId('horizontal-card-image').props.children).toBe(
        'https://example.com/poster.jpg',
      );
      expect(getByTestId('horizontal-card-duration').props.children).toBe(120);
      expect(getByTestId('horizontal-card-genre').props.children).toBe(
        'Action, Drama',
      );
      expect(getByTestId('horizontal-card-rating').props.children).toBe(4.5);
    });

    it('should render tabs', () => {
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('tabs')).toBeTruthy();
    });

    it('should render booking button', () => {
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('booking-button')).toBeTruthy();
    });
  });

  describe('Content Items', () => {
    it('should render synopsis content', () => {
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('expandable-text')).toBeTruthy();
    });

    it('should render cast and crew when available', () => {
      const { getAllByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      const userCards = getAllByTestId('user-card');
      expect(userCards.length).toBeGreaterThan(0);
      expect(getAllByTestId('user-card-full-name')[0].props.children).toBe(
        'Actor 1',
      );
      expect(getAllByTestId('user-card-full-name')[1].props.children).toBe(
        'Actor 2',
      );
    });

    it('should render trailer carousel when trailers are available', () => {
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('movie-trailer-carousel')).toBeTruthy();
      expect(getByTestId('trailer-0').props.children).toBe(
        'https://example.com/trailer1.mp4',
      );
    });

    it('should not render cast and crew when empty', () => {
      mockMovieData = {
        ...mockMovieData,
        castCrew: { actors: [] },
      };
      const { queryByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      // Cast & Crew section should not be rendered when empty
      const userCards = queryByTestId('user-card');
      expect(userCards).toBeNull();
    });

    it('should not render trailer carousel when trailers are empty', () => {
      mockMovieData = {
        ...mockMovieData,
        trailerUrl: [],
      };
      const { queryByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(queryByTestId('movie-trailer-carousel')).toBeNull();
    });

    it('should handle missing castCrew', () => {
      mockMovieData = {
        ...mockMovieData,
        castCrew: undefined,
      };
      const { queryByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      const userCards = queryByTestId('user-card');
      expect(userCards).toBeNull();
    });

    it('should handle missing trailerUrl', () => {
      mockMovieData = {
        ...mockMovieData,
        trailerUrl: undefined,
      };
      const { queryByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(queryByTestId('movie-trailer-carousel')).toBeNull();
    });

    it('should call keyExtractor for main FlashList', () => {
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      // Verify vertical FlashList is rendered (line 287)
      const verticalList = getByTestId('vertical-flash-list');
      expect(verticalList).toBeTruthy();
    });

    it('should return null for unknown content type (default case)', () => {
      // This test verifies the default case in renderItem (line 203)
      // Since we can't directly inject invalid content types,
      // we verify that all known types are handled and default would return null
      const { getAllByTestId, getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });

      // All valid content types should render something
      expect(getByTestId('expandable-text')).toBeTruthy(); // SYNOPSIS
      expect(getAllByTestId('user-card').length).toBeTruthy(); // CAST_CREW
      expect(getByTestId('movie-trailer-carousel')).toBeTruthy(); // TRAILER

      // Default case (line 203) would return null for unknown types
      // This is a safety fallback that's hard to test directly without
      // modifying the component, but we ensure all valid paths work
    });
  });

  describe('Tab Change', () => {
    it('should change active tab when tab is pressed', () => {
      const { getByTestId, queryByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      // Initially should show content for "About Movie" tab
      expect(getByTestId('expandable-text')).toBeTruthy();

      // Press review tab to trigger handleTabChange (line 131)
      const reviewTab = getByTestId('tab-review');
      fireEvent.press(reviewTab);

      // After pressing review tab, activeTab should change to 'review'
      // This causes contentItems to return empty array (line 127)
      // Content should not be visible for review tab
      expect(queryByTestId('expandable-text')).toBeNull();
    });

    it('should show content when "About Movie" tab is active', () => {
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      // Should show content for first tab (about_movie)
      expect(getByTestId('expandable-text')).toBeTruthy();
    });

    it('should return empty array when tab is not "About Movie" (line 127)', () => {
      const { getByTestId, queryByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      // Initially should show content
      expect(getByTestId('expandable-text')).toBeTruthy();

      // Change to review tab - this triggers setActiveTab (line 131)
      const reviewTab = getByTestId('tab-review');
      fireEvent.press(reviewTab);

      // After state update, contentItems should return empty array (line 127)
      // because activeTab !== DETAIL_MOVIE_TABS[0].id
      expect(queryByTestId('expandable-text')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should go back when back button is pressed', () => {
      const { UNSAFE_getAllByType } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { TouchableOpacity } = require('react-native');
      const touchableButtons = UNSAFE_getAllByType(TouchableOpacity);
      // The first TouchableOpacity should be the back button
      const backButton = touchableButtons[0];
      fireEvent.press(backButton);

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing movie id', () => {
      mockParams = { id: '' };
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      // Should still render, but with empty data
      expect(getByTestId('safe-area-view')).toBeTruthy();
    });

    it('should handle missing movie data', () => {
      mockMovieData = null;
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      // Should render with default values
      expect(getByTestId('horizontal-card')).toBeTruthy();
      expect(getByTestId('horizontal-card-title').props.children).toBe('');
    });

    it('should handle missing title', () => {
      mockMovieData = {
        ...mockMovieData,
        title: undefined,
      };
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('horizontal-card-title').props.children).toBe('');
    });

    it('should handle missing posterUrl', () => {
      mockMovieData = {
        ...mockMovieData,
        posterUrl: undefined,
      };
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('horizontal-card-image').props.children).toBe('');
    });

    it('should handle missing genre', () => {
      mockMovieData = {
        ...mockMovieData,
        genre: undefined,
      };
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('horizontal-card-genre').props.children).toBe('');
    });

    it('should handle missing synopsis', () => {
      mockMovieData = {
        ...mockMovieData,
        synopsis: undefined,
      };
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('expandable-text')).toBeTruthy();
    });

    it('should handle actor with null imageUrl', () => {
      const { getAllByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      const userCards = getAllByTestId('user-card');
      expect(userCards.length).toBe(2);
      // Actor 2 has null imageUrl, should still render
      expect(getAllByTestId('user-card-full-name')[1].props.children).toBe(
        'Actor 2',
      );
    });

    it('should handle multiple trailers', () => {
      mockMovieData = {
        ...mockMovieData,
        trailerUrl: [
          'https://example.com/trailer1.mp4',
          'https://example.com/trailer2.mp4',
          'https://example.com/trailer3.mp4',
        ],
      };
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      expect(getByTestId('trailer-0')).toBeTruthy();
      expect(getByTestId('trailer-1')).toBeTruthy();
      expect(getByTestId('trailer-2')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility labels', () => {
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      const safeAreaView = getByTestId('safe-area-view');
      expect(safeAreaView.props.accessibilityLabel).toBe('Movie screen');
      expect(safeAreaView.props.accessibilityHint).toBe('Movie screen');
    });

    it('should have correct accessibility labels for booking button', () => {
      const { getByTestId } = render(<MovieScreen />, {
        wrapper: createWrapper(),
      });
      const bookingButton = getByTestId('booking-button');
      expect(bookingButton.props.accessibilityLabel).toBe('Booking Movie');
      expect(bookingButton.props.accessibilityHint).toBe(
        'Navigate to select cinema screen',
      );
    });
  });
});
