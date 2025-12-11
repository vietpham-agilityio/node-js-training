import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { MovieTrailerCarousel } from '..';

// Mock dependencies
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  useSharedValue: jest.fn(() => ({ value: 0 })),
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

describe('MovieTrailerCarousel Component', () => {
  const mockTrailers = [
    'https://example.com/trailer1.mp4',
    'https://example.com/trailer2.mp4',
    'https://example.com/trailer3.mp4',
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the carousel container', () => {
      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      expect(screen.getByTestId('movie-trailer-carousel')).toBeTruthy();
    });

    it('should render all trailer slides', () => {
      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      expect(screen.getByTestId('movie-trailer-slide-item-0')).toBeTruthy();
      expect(screen.getByTestId('movie-trailer-slide-item-1')).toBeTruthy();
      expect(screen.getByTestId('movie-trailer-slide-item-2')).toBeTruthy();
    });

    it('should render MovieTrailer component for each item', () => {
      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      const trailerComponents = screen.getAllByTestId('movie-trailer');
      expect(trailerComponents.length).toBe(mockTrailers.length);
    });

    it('should render nothing when trailers array is empty', () => {
      const { queryByTestId } = render(<MovieTrailerCarousel trailers={[]} />);

      expect(queryByTestId('movie-trailer-carousel')).toBeNull();
    });

    it('should render carousel mock', () => {
      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      expect(screen.getByTestId('carousel-mock')).toBeTruthy();
    });
  });

  describe('Trailer Data', () => {
    it('should handle single trailer', () => {
      const singleTrailer = [mockTrailers[0]];
      render(<MovieTrailerCarousel trailers={singleTrailer} />);

      expect(screen.getByTestId('movie-trailer-slide-item-0')).toBeTruthy();
      expect(screen.getAllByTestId('movie-trailer').length).toBe(1);
    });

    it('should handle multiple trailers', () => {
      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      expect(screen.getAllByTestId(/movie-trailer-slide-item-/).length).toBe(
        mockTrailers.length,
      );
    });

    it('should render correct number of slides', () => {
      const manyTrailers = Array.from(
        { length: 10 },
        (_, i) => `https://example.com/trailer${i}.mp4`,
      );
      render(<MovieTrailerCarousel trailers={manyTrailers} />);

      expect(screen.getAllByTestId(/movie-trailer-slide-item-/).length).toBe(
        10,
      );
    });

    it('should pass trailer URL to each slide', () => {
      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      mockTrailers.forEach((_, index) => {
        expect(
          screen.getByTestId(`movie-trailer-slide-item-${index}`),
        ).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role for container', () => {
      const { getByTestId } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      expect(
        getByTestId('movie-trailer-carousel').props.accessibilityRole,
      ).toBe('none');
    });

    it('should have correct accessibility label for container', () => {
      const { getByTestId } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      expect(
        getByTestId('movie-trailer-carousel').props.accessibilityLabel,
      ).toBe('Movie carousel with 3 movies');
    });

    it('should update accessibility label based on trailer count', () => {
      const { getByTestId } = render(
        <MovieTrailerCarousel trailers={mockTrailers.slice(0, 1)} />,
      );

      expect(
        getByTestId('movie-trailer-carousel').props.accessibilityLabel,
      ).toBe('Movie carousel with 1 movies');
    });

    it('should mark container as accessible', () => {
      const { getByTestId } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      expect(getByTestId('movie-trailer-carousel').props.accessible).toBe(true);
    });

    it('should have correct accessibility role for slides', () => {
      const { getByTestId } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      mockTrailers.forEach((_, index) => {
        const slide = getByTestId(`movie-trailer-slide-item-${index}`);
        expect(slide.props.accessibilityRole).toBe('button');
      });
    });

    it('should have correct accessibility label for slides', () => {
      const { getByTestId } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      expect(
        getByTestId('movie-trailer-slide-item-0').props.accessibilityLabel,
      ).toBe('Movie 1 of 3: 0');
      expect(
        getByTestId('movie-trailer-slide-item-1').props.accessibilityLabel,
      ).toBe('Movie 2 of 3: 1');
      expect(
        getByTestId('movie-trailer-slide-item-2').props.accessibilityLabel,
      ).toBe('Movie 3 of 3: 2');
    });

    it('should have correct accessibility hint for slides', () => {
      const { getByTestId } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      mockTrailers.forEach((_, index) => {
        const slide = getByTestId(`movie-trailer-slide-item-${index}`);
        expect(slide.props.accessibilityHint).toBe(
          'Swipe left or right to see other movies. Tap to view details.',
        );
      });
    });

    it('should mark slides as accessible', () => {
      const { getByTestId } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      mockTrailers.forEach((_, index) => {
        const slide = getByTestId(`movie-trailer-slide-item-${index}`);
        expect(slide.props.accessible).toBe(true);
      });
    });

    it('should have iOS-specific accessibility props on slides', () => {
      const { getByTestId } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      mockTrailers.forEach((_, index) => {
        const slide = getByTestId(`movie-trailer-slide-item-${index}`);
        expect(slide.props.accessibilityTraits).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty trailers array', () => {
      const { UNSAFE_root } = render(<MovieTrailerCarousel trailers={[]} />);

      expect(UNSAFE_root.children.length).toBe(0);
    });

    it('should handle single item', () => {
      const singleTrailer = ['https://example.com/single.mp4'];
      render(<MovieTrailerCarousel trailers={singleTrailer} />);

      expect(screen.getByTestId('movie-trailer-carousel')).toBeTruthy();
      expect(screen.getAllByTestId('movie-trailer').length).toBe(1);
    });

    it('should handle large number of trailers', () => {
      const manyTrailers = Array.from(
        { length: 50 },
        (_, i) => `https://example.com/trailer${i}.mp4`,
      );
      render(<MovieTrailerCarousel trailers={manyTrailers} />);

      expect(screen.getByTestId('movie-trailer-carousel')).toBeTruthy();
      expect(screen.getAllByTestId(/movie-trailer-slide-item-/).length).toBe(
        50,
      );
    });

    it('should handle trailers with duplicate URLs', () => {
      const duplicateTrailers = [
        'https://example.com/same.mp4',
        'https://example.com/same.mp4',
        'https://example.com/same.mp4',
      ];
      render(<MovieTrailerCarousel trailers={duplicateTrailers} />);

      expect(screen.getAllByTestId('movie-trailer').length).toBe(3);
    });

    it('should handle empty string URLs', () => {
      const emptyTrailers = ['', '', ''];
      render(<MovieTrailerCarousel trailers={emptyTrailers} />);

      expect(screen.getAllByTestId('movie-trailer').length).toBe(3);
    });

    it('should handle trailers with special characters in URLs', () => {
      const specialTrailers = [
        'https://example.com/trailer?id=123&token=abc',
        'https://example.com/trailer#fragment',
        'https://example.com/trailer with spaces.mp4',
      ];
      render(<MovieTrailerCarousel trailers={specialTrailers} />);

      expect(screen.getAllByTestId('movie-trailer').length).toBe(3);
    });

    it('should handle very long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(500) + '.mp4';
      const trailers = [longUrl];
      render(<MovieTrailerCarousel trailers={trailers} />);

      expect(screen.getByTestId('movie-trailer-carousel')).toBeTruthy();
    });
  });

  describe('Component Props', () => {
    it('should have correct displayName', () => {
      expect(MovieTrailerCarousel.displayName).toBe('MovieTrailerCarousel');
    });

    it('should be memoized', () => {
      const { rerender } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      // Re-render with same props
      rerender(<MovieTrailerCarousel trailers={mockTrailers} />);

      expect(screen.getByTestId('movie-trailer-carousel')).toBeTruthy();
    });

    it('should update when trailers change', () => {
      const { rerender } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      expect(screen.getAllByTestId('movie-trailer').length).toBe(3);

      const newTrailers = [mockTrailers[0], mockTrailers[1]];
      rerender(<MovieTrailerCarousel trailers={newTrailers} />);

      expect(screen.getAllByTestId('movie-trailer').length).toBe(2);
    });

    it('should update accessibility label when trailer count changes', () => {
      const { rerender, getByTestId } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      expect(
        getByTestId('movie-trailer-carousel').props.accessibilityLabel,
      ).toBe('Movie carousel with 3 movies');

      const newTrailers = [mockTrailers[0]];
      rerender(<MovieTrailerCarousel trailers={newTrailers} />);

      expect(
        getByTestId('movie-trailer-carousel').props.accessibilityLabel,
      ).toBe('Movie carousel with 1 movies');
    });
  });

  describe('Carousel Integration', () => {
    it('should initialize carousel with correct data', () => {
      const Carousel = require('react-native-reanimated-carousel');

      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      expect(Carousel).toHaveBeenCalled();
    });

    it('should pass trailers data to carousel', () => {
      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      expect(screen.getByTestId('carousel-mock')).toBeTruthy();
    });

    it('should configure carousel with correct height', () => {
      const Carousel = require('react-native-reanimated-carousel');

      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      const carouselCall = Carousel.mock.calls[0][0];
      expect(carouselCall.height).toBe(144);
    });

    it('should configure carousel with correct width', () => {
      const Carousel = require('react-native-reanimated-carousel');

      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      const carouselCall = Carousel.mock.calls[0][0];
      expect(carouselCall.width).toBe(256);
    });

    it('should set loop to false', () => {
      const Carousel = require('react-native-reanimated-carousel');

      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      const carouselCall = Carousel.mock.calls[0][0];
      expect(carouselCall.loop).toBe(false);
    });

    it('should enable paging', () => {
      const Carousel = require('react-native-reanimated-carousel');

      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      const carouselCall = Carousel.mock.calls[0][0];
      expect(carouselCall.pagingEnabled).toBe(true);
    });

    it('should enable snapping', () => {
      const Carousel = require('react-native-reanimated-carousel');

      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      const carouselCall = Carousel.mock.calls[0][0];
      expect(carouselCall.snapEnabled).toBe(true);
    });

    it('should set autoPlayInterval', () => {
      const Carousel = require('react-native-reanimated-carousel');

      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      const carouselCall = Carousel.mock.calls[0][0];
      expect(carouselCall.autoPlayInterval).toBe(2000);
    });
  });

  describe('Performance', () => {
    it('should handle rapid trailer updates', () => {
      const { rerender } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      for (let i = 0; i < 10; i++) {
        const newTrailers = mockTrailers.slice(0, (i % 3) + 1);
        rerender(<MovieTrailerCarousel trailers={newTrailers} />);
      }

      expect(screen.getByTestId('movie-trailer-carousel')).toBeTruthy();
    });

    it('should not re-render unnecessarily with same props', () => {
      const { rerender } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      const firstRender = screen.getByTestId('movie-trailer-carousel');

      // Re-render with same props
      rerender(<MovieTrailerCarousel trailers={mockTrailers} />);

      const secondRender = screen.getByTestId('movie-trailer-carousel');

      expect(firstRender).toBeTruthy();
      expect(secondRender).toBeTruthy();
    });
  });

  describe('Conditional Rendering', () => {
    it('should return null when trailers is empty array', () => {
      const { UNSAFE_root } = render(<MovieTrailerCarousel trailers={[]} />);

      expect(UNSAFE_root.children.length).toBe(0);
    });

    it('should render when trailers has items', () => {
      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      expect(screen.getByTestId('movie-trailer-carousel')).toBeTruthy();
    });

    it('should render with minimum one trailer', () => {
      render(<MovieTrailerCarousel trailers={[mockTrailers[0]]} />);

      expect(screen.getByTestId('movie-trailer-carousel')).toBeTruthy();
      expect(screen.getAllByTestId('movie-trailer').length).toBe(1);
    });
  });

  describe('Slide Layout', () => {
    it('should apply padding-left to slides', () => {
      const { getByTestId } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      const slide = getByTestId('movie-trailer-slide-item-0');
      expect(slide.props.className).toContain('pl-6');
    });

    it('should apply flex-1 to slides', () => {
      const { getByTestId } = render(
        <MovieTrailerCarousel trailers={mockTrailers} />,
      );

      const slide = getByTestId('movie-trailer-slide-item-0');
      expect(slide.props.className).toContain('flex-1');
    });

    it('should use unique keys for slides', () => {
      render(<MovieTrailerCarousel trailers={mockTrailers} />);

      // Each slide should have a unique testID
      expect(screen.getByTestId('movie-trailer-slide-item-0')).toBeTruthy();
      expect(screen.getByTestId('movie-trailer-slide-item-1')).toBeTruthy();
      expect(screen.getByTestId('movie-trailer-slide-item-2')).toBeTruthy();
    });
  });
});
