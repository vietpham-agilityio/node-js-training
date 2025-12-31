import { render, screen } from '@testing-library/react-native';

// Components
import { MovieContentSkeleton } from '../index';

describe('MovieContentSkeleton', () => {
  describe('Rendering', () => {
    it('should render the skeleton container', () => {
      render(<MovieContentSkeleton />);

      expect(screen.getByTestId('movie-content-skeleton')).toBeTruthy();
    });

    it('should have correct accessibility label', () => {
      render(<MovieContentSkeleton />);

      expect(screen.getByLabelText('Loading movie content')).toBeTruthy();
    });
  });

  describe('Section Title', () => {
    it('should render section title skeleton', () => {
      const { getByTestId } = render(<MovieContentSkeleton />);

      expect(getByTestId('movie-content-skeleton-title')).toBeTruthy();
    });

    it('should render section title with correct accessibility label', () => {
      const { getByLabelText } = render(<MovieContentSkeleton />);

      expect(getByLabelText('Loading section title')).toBeTruthy();
    });
  });

  describe('Content Lines', () => {
    it('should render all content line skeletons', () => {
      render(<MovieContentSkeleton />);

      expect(screen.getByTestId('movie-content-skeleton-line-1')).toBeTruthy();
      expect(screen.getByTestId('movie-content-skeleton-line-2')).toBeTruthy();
      expect(screen.getByTestId('movie-content-skeleton-line-3')).toBeTruthy();
      expect(screen.getByTestId('movie-content-skeleton-line-4')).toBeTruthy();
    });

    it('should render content lines with correct accessibility label', () => {
      render(<MovieContentSkeleton />);

      const contentLines = screen.getAllByLabelText('Loading content line');
      expect(contentLines).toHaveLength(4);
    });
  });

  describe('Component Structure', () => {
    it('should render container with correct testID', () => {
      const { getByTestId } = render(<MovieContentSkeleton />);

      expect(getByTestId('movie-content-skeleton')).toBeTruthy();
    });

    it('should render all skeleton elements', () => {
      render(<MovieContentSkeleton />);

      expect(screen.getByTestId('movie-content-skeleton')).toBeTruthy();
      expect(screen.getByTestId('movie-content-skeleton-title')).toBeTruthy();
      expect(screen.getByTestId('movie-content-skeleton-line-1')).toBeTruthy();
      expect(screen.getByTestId('movie-content-skeleton-line-2')).toBeTruthy();
      expect(screen.getByTestId('movie-content-skeleton-line-3')).toBeTruthy();
      expect(screen.getByTestId('movie-content-skeleton-line-4')).toBeTruthy();
    });
  });
});
