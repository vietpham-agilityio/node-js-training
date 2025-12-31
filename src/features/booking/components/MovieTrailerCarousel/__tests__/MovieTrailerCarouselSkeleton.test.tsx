import { render, screen } from '@testing-library/react-native';

// Components
import { MovieTrailerCarouselSkeleton } from '../MovieTrailerCarouselSkeleton';

describe('MovieTrailerCarouselSkeleton', () => {
  describe('Rendering', () => {
    it('should render the skeleton container', () => {
      render(<MovieTrailerCarouselSkeleton />);

      expect(
        screen.getByTestId('movie-trailer-carousel-skeleton'),
      ).toBeTruthy();
    });

    it('should render with default count of 3 items', () => {
      render(<MovieTrailerCarouselSkeleton />);

      const skeletonItems = screen.getAllByTestId(
        /movie-trailer-skeleton-item-/,
      );
      expect(skeletonItems).toHaveLength(3);
    });

    it('should render with custom count', () => {
      render(<MovieTrailerCarouselSkeleton count={5} />);

      const skeletonItems = screen.getAllByTestId(
        /movie-trailer-skeleton-item-/,
      );
      expect(skeletonItems).toHaveLength(5);
    });

    it('should have correct accessibility label', () => {
      render(<MovieTrailerCarouselSkeleton />);

      expect(screen.getByLabelText('Loading trailers')).toBeTruthy();
    });
  });

  describe('Section Title', () => {
    it('should render section title skeleton', () => {
      const { getByTestId } = render(<MovieTrailerCarouselSkeleton />);

      expect(getByTestId('movie-trailer-skeleton-title')).toBeTruthy();
    });

    it('should render section title with correct accessibility label', () => {
      const { getByLabelText } = render(<MovieTrailerCarouselSkeleton />);

      expect(getByLabelText('Loading section title')).toBeTruthy();
    });
  });

  describe('Trailer Items', () => {
    it('should render trailer skeleton items with correct accessibility label', () => {
      render(<MovieTrailerCarouselSkeleton count={2} />);

      const skeletonItems = screen.getAllByLabelText('Loading trailer');
      expect(skeletonItems).toHaveLength(2);
    });

    it('should render trailer items with unique testIDs', () => {
      render(<MovieTrailerCarouselSkeleton count={3} />);

      expect(screen.getByTestId('movie-trailer-skeleton-item-0')).toBeTruthy();
      expect(screen.getByTestId('movie-trailer-skeleton-item-1')).toBeTruthy();
      expect(screen.getByTestId('movie-trailer-skeleton-item-2')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle count of 0', () => {
      render(<MovieTrailerCarouselSkeleton count={0} />);

      const skeletonItems = screen.queryAllByTestId(
        /movie-trailer-skeleton-item-/,
      );
      expect(skeletonItems).toHaveLength(0);
    });

    it('should handle count of 1', () => {
      render(<MovieTrailerCarouselSkeleton count={1} />);

      const skeletonItems = screen.getAllByTestId(
        /movie-trailer-skeleton-item-/,
      );
      expect(skeletonItems).toHaveLength(1);
    });

    it('should handle large count values', () => {
      render(<MovieTrailerCarouselSkeleton count={10} />);

      const skeletonItems = screen.getAllByTestId(
        /movie-trailer-skeleton-item-/,
      );
      expect(skeletonItems).toHaveLength(10);
    });
  });

  describe('Component Structure', () => {
    it('should render container with correct testID', () => {
      const { getByTestId } = render(<MovieTrailerCarouselSkeleton />);

      expect(getByTestId('movie-trailer-carousel-skeleton')).toBeTruthy();
    });

    it('should render all skeleton elements', () => {
      render(<MovieTrailerCarouselSkeleton count={2} />);

      expect(
        screen.getByTestId('movie-trailer-carousel-skeleton'),
      ).toBeTruthy();
      expect(screen.getByTestId('movie-trailer-skeleton-title')).toBeTruthy();
      expect(screen.getByTestId('movie-trailer-skeleton-item-0')).toBeTruthy();
      expect(screen.getByTestId('movie-trailer-skeleton-item-1')).toBeTruthy();
    });
  });
});
