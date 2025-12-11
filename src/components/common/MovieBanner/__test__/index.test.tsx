import { MovieStatus, type Movie } from '@/types';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { MovieBanner } from '..';

// Mock expo-image
jest.mock('expo-image', () => ({
  Image: ({ source, testID, ...props }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID={testID} {...props}>
        <Text>{source.uri}</Text>
      </View>
    );
  },
}));

// Mock uniwind
jest.mock('uniwind', () => ({
  withUniwind: (Component: any) => Component,
}));

describe('MovieBanner Component', () => {
  const mockMovie: Movie = {
    id: '1',
    title: 'Wreck It Ralph 2',
    synopsis: 'Ralph and Vanellope venture into the internet...',
    posterUrl: 'https://example.com/poster.jpg',
    rating: 4.7,
    durationMinutes: 112,
    genre: ['Animation', 'Comedy', 'Adventure'],
    language: 'EN',
    trailerUrl: ['https://example.com/trailer.mp4'],
    releaseDate: '2023-06-15',
    createdAt: '2023-06-15T12:34:56Z',
    updatedAt: '2023-06-15T12:34:56Z',
    status: MovieStatus.NOW_PLAYING,
  };

  const mockOnPress = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render MovieBanner component', () => {
      render(<MovieBanner movie={mockMovie} />);

      expect(screen.getByTestId('movie-banner')).toBeTruthy();
    });

    it('should render movie poster image', () => {
      render(<MovieBanner movie={mockMovie} />);

      expect(screen.getByText(mockMovie.posterUrl)).toBeTruthy();
    });
  });

  describe('Horizontal Variant', () => {
    it('should display movie title in horizontal variant', () => {
      render(<MovieBanner movie={mockMovie} variant="horizontal" />);

      expect(screen.getByText(mockMovie.title)).toBeTruthy();
    });

    it('should render title with correct testID', () => {
      render(<MovieBanner movie={mockMovie} variant="horizontal" />);

      expect(screen.getByTestId('movie-banner-title')).toBeTruthy();
    });

    it('should display long movie titles', () => {
      const longTitleMovie = {
        ...mockMovie,
        title: 'The Lord of the Rings: The Fellowship of the Ring',
      };

      render(<MovieBanner movie={longTitleMovie} variant="horizontal" />);

      expect(screen.getByText(longTitleMovie.title)).toBeTruthy();
    });
  });

  describe('Vertical Variant', () => {
    it('should not display movie title in vertical variant', () => {
      render(<MovieBanner movie={mockMovie} variant="vertical" />);

      expect(screen.queryByText(mockMovie.title)).toBeNull();
    });

    it('should not display rating in vertical variant', () => {
      render(<MovieBanner movie={mockMovie} variant="vertical" />);

      expect(screen.queryByText(`Rating: ${mockMovie.rating}`)).toBeNull();
    });

    it('should not render title testID in vertical variant', () => {
      render(<MovieBanner movie={mockMovie} variant="vertical" />);

      expect(screen.queryByTestId('movie-banner-title')).toBeNull();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when banner is pressed', () => {
      render(<MovieBanner movie={mockMovie} onPress={mockOnPress} />);

      fireEvent.press(screen.getByTestId('movie-banner'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not throw error when onPress is not provided', () => {
      render(<MovieBanner movie={mockMovie} />);

      expect(() => {
        fireEvent.press(screen.getByTestId('movie-banner'));
      }).not.toThrow();
    });

    it('should call onPress multiple times', () => {
      render(<MovieBanner movie={mockMovie} onPress={mockOnPress} />);
      const banner = screen.getByTestId('movie-banner');

      fireEvent.press(banner);
      fireEvent.press(banner);
      fireEvent.press(banner);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role', () => {
      const { getByTestId } = render(<MovieBanner movie={mockMovie} />);
      const banner = getByTestId('movie-banner');

      expect(banner.props.accessibilityRole).toBe('button');
    });

    it('should have default accessibility label', () => {
      const { getByTestId } = render(<MovieBanner movie={mockMovie} />);
      const banner = getByTestId('movie-banner');

      expect(banner.props.accessibilityLabel).toBe(
        `View details for ${mockMovie.title}`,
      );
    });

    it('should use custom accessibility label when provided', () => {
      const customLabel = 'Custom movie banner label';
      const { getByTestId } = render(
        <MovieBanner movie={mockMovie} accessibilityLabel={customLabel} />,
      );
      const banner = getByTestId('movie-banner');

      expect(banner.props.accessibilityLabel).toBe(customLabel);
    });

    it('should have accessibility hint', () => {
      const { getByTestId } = render(<MovieBanner movie={mockMovie} />);
      const banner = getByTestId('movie-banner');

      expect(banner.props.accessibilityHint).toBe(
        'Double tap to view movie details',
      );
    });
  });

  describe('Movie Data', () => {
    it('should display different movie titles', () => {
      const movies = [
        { ...mockMovie, title: 'Inception' },
        { ...mockMovie, title: 'The Matrix' },
        { ...mockMovie, title: 'Interstellar' },
      ];

      movies.forEach(movie => {
        const { rerender, getByText } = render(
          <MovieBanner movie={movie} variant="horizontal" />,
        );

        expect(getByText(movie.title)).toBeTruthy();

        rerender(<MovieBanner movie={mockMovie} variant="horizontal" />);
      });
    });

    it('should handle different poster URLs', () => {
      const urls = [
        'https://example.com/poster1.jpg',
        'https://example.com/poster2.jpg',
        'https://example.com/poster3.jpg',
      ];

      urls.forEach(posterUrl => {
        const { rerender, getByText } = render(
          <MovieBanner movie={{ ...mockMovie, posterUrl }} />,
        );

        expect(getByText(posterUrl)).toBeTruthy();

        rerender(<MovieBanner movie={mockMovie} />);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty movie title', () => {
      const emptyTitleMovie = { ...mockMovie, title: '' };

      render(<MovieBanner movie={emptyTitleMovie} variant="horizontal" />);

      expect(screen.getByTestId('movie-banner-title')).toBeTruthy();
    });

    it('should handle very long movie titles', () => {
      const longTitle =
        'This is an extremely long movie title that should be handled properly by the component';
      const longTitleMovie = { ...mockMovie, title: longTitle };

      render(<MovieBanner movie={longTitleMovie} variant="horizontal" />);

      expect(screen.getByText(longTitle)).toBeTruthy();
    });

    it('should handle missing posterUrl gracefully', () => {
      const noPosterMovie = { ...mockMovie, posterUrl: '' };

      expect(() => {
        render(<MovieBanner movie={noPosterMovie} />);
      }).not.toThrow();
    });
  });

  describe('Component Props', () => {
    it('should have correct displayName', () => {
      expect(MovieBanner.displayName).toBe('MovieBanner');
    });

    it('should be memoized', () => {
      const { rerender } = render(<MovieBanner movie={mockMovie} />);

      // Re-render with same props
      rerender(<MovieBanner movie={mockMovie} />);

      expect(screen.getByTestId('movie-banner')).toBeTruthy();
    });

    it('should re-render when movie changes', () => {
      const { rerender, getByTestId } = render(
        <MovieBanner movie={mockMovie} variant="horizontal" />,
      );

      expect(getByTestId('movie-banner').props.accessibilityLabel).toBe(
        `View details for ${mockMovie.title}`,
      );

      const newMovie = { ...mockMovie, title: 'New Movie Title' };
      rerender(<MovieBanner movie={newMovie} variant="horizontal" />);

      expect(getByTestId('movie-banner').props.accessibilityLabel).toBe(
        `View details for ${newMovie.title}`,
      );
    });

    it('should re-render when variant changes', () => {
      const { rerender, getByTestId, queryByText } = render(
        <MovieBanner movie={mockMovie} variant="horizontal" />,
      );

      expect(queryByText(mockMovie.title)).toBeTruthy();

      rerender(<MovieBanner movie={mockMovie} variant="vertical" />);

      expect(queryByText(mockMovie.title)).toBeNull();
    });
  });
});
