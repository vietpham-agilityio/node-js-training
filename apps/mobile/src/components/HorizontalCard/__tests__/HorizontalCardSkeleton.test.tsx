import { render } from '@testing-library/react-native';

// Components
import { HorizontalCardSkeleton } from '../../Skeletons/HorizontalCardSkeleton';

// Constants
import { Size } from '@/constants';

describe('HorizontalCardSkeleton', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<HorizontalCardSkeleton />);
      expect(getByTestId('horizontal-card-skeleton')).toBeTruthy();
    });

    it('should render with default testID', () => {
      const { getByTestId } = render(<HorizontalCardSkeleton />);
      expect(getByTestId('horizontal-card-skeleton')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <HorizontalCardSkeleton testID="custom-skeleton" />,
      );
      expect(getByTestId('custom-skeleton')).toBeTruthy();
    });

    it('should have correct accessibility label', () => {
      const { getByLabelText } = render(<HorizontalCardSkeleton />);
      expect(getByLabelText('Loading movie card')).toBeTruthy();
    });
  });

  describe('Image Skeleton', () => {
    it('should render image skeleton', () => {
      const { getByTestId } = render(<HorizontalCardSkeleton />);
      expect(getByTestId('horizontal-card-skeleton-image')).toBeTruthy();
    });

    it('should render image skeleton with correct accessibility label', () => {
      const { getByLabelText } = render(<HorizontalCardSkeleton />);
      expect(getByLabelText('Loading movie poster')).toBeTruthy();
    });
  });

  describe('Content Skeletons', () => {
    it('should render title skeleton', () => {
      const { getByTestId } = render(<HorizontalCardSkeleton />);
      expect(getByTestId('horizontal-card-skeleton-title')).toBeTruthy();
    });

    it('should render rating skeleton', () => {
      const { getByTestId } = render(<HorizontalCardSkeleton />);
      expect(getByTestId('horizontal-card-skeleton-rating')).toBeTruthy();
    });

    it('should render genres skeleton', () => {
      const { getByTestId } = render(<HorizontalCardSkeleton />);
      expect(getByTestId('horizontal-card-skeleton-genres')).toBeTruthy();
    });
  });

  describe('Image Sizes', () => {
    it('should render with SMALL image size', () => {
      const { getByTestId } = render(
        <HorizontalCardSkeleton imageSize={Size.SMALL} />,
      );
      expect(getByTestId('horizontal-card-skeleton')).toBeTruthy();
    });

    it('should render with MEDIUM image size (default)', () => {
      const { getByTestId } = render(
        <HorizontalCardSkeleton imageSize={Size.MEDIUM} />,
      );
      expect(getByTestId('horizontal-card-skeleton')).toBeTruthy();
    });

    it('should render with LARGE image size', () => {
      const { getByTestId } = render(
        <HorizontalCardSkeleton imageSize={Size.LARGE} />,
      );
      expect(getByTestId('horizontal-card-skeleton')).toBeTruthy();
    });

    it('should render with EXTRA_SMALL image size', () => {
      const { getByTestId } = render(
        <HorizontalCardSkeleton imageSize={Size.EXTRA_SMALL} />,
      );
      expect(getByTestId('horizontal-card-skeleton')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should render all skeleton elements', () => {
      const { getByTestId } = render(<HorizontalCardSkeleton />);

      expect(getByTestId('horizontal-card-skeleton')).toBeTruthy();
      expect(getByTestId('horizontal-card-skeleton-image')).toBeTruthy();
      expect(getByTestId('horizontal-card-skeleton-title')).toBeTruthy();
      expect(getByTestId('horizontal-card-skeleton-rating')).toBeTruthy();
      expect(getByTestId('horizontal-card-skeleton-genres')).toBeTruthy();
    });
  });
});
