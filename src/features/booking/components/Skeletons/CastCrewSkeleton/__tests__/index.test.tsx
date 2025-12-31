import { render, screen } from '@testing-library/react-native';

// Components
import { CastCrewSkeleton } from '../index';

describe('CastCrewSkeleton', () => {
  describe('Rendering', () => {
    it('should render the skeleton container', () => {
      render(<CastCrewSkeleton />);

      expect(screen.getByTestId('cast-crew-skeleton')).toBeTruthy();
    });

    it('should render with default count of 5 items', () => {
      render(<CastCrewSkeleton />);

      const skeletonItems = screen.getAllByTestId(/cast-crew-skeleton-item-/);
      expect(skeletonItems).toHaveLength(5);
    });

    it('should render with custom count', () => {
      render(<CastCrewSkeleton count={3} />);

      const skeletonItems = screen.getAllByTestId(/cast-crew-skeleton-item-/);
      expect(skeletonItems).toHaveLength(3);
    });

    it('should have correct accessibility label', () => {
      render(<CastCrewSkeleton />);

      expect(screen.getByLabelText('Loading cast and crew')).toBeTruthy();
    });
  });

  describe('Section Title', () => {
    it('should render section title skeleton', () => {
      const { getByTestId } = render(<CastCrewSkeleton />);

      expect(getByTestId('cast-crew-skeleton-title')).toBeTruthy();
    });

    it('should render section title with correct accessibility label', () => {
      const { getByLabelText } = render(<CastCrewSkeleton />);

      expect(getByLabelText('Loading section title')).toBeTruthy();
    });
  });

  describe('Cast Items', () => {
    it('should render cast items with unique testIDs', () => {
      render(<CastCrewSkeleton count={3} />);

      expect(screen.getByTestId('cast-crew-skeleton-item-0')).toBeTruthy();
      expect(screen.getByTestId('cast-crew-skeleton-item-1')).toBeTruthy();
      expect(screen.getByTestId('cast-crew-skeleton-item-2')).toBeTruthy();
    });

    it('should render avatar skeleton for each item', () => {
      render(<CastCrewSkeleton count={2} />);

      expect(screen.getByTestId('cast-crew-skeleton-avatar-0')).toBeTruthy();
      expect(screen.getByTestId('cast-crew-skeleton-avatar-1')).toBeTruthy();
    });

    it('should render name skeleton for each item', () => {
      render(<CastCrewSkeleton count={2} />);

      expect(screen.getByTestId('cast-crew-skeleton-name-0')).toBeTruthy();
      expect(screen.getByTestId('cast-crew-skeleton-name-1')).toBeTruthy();
    });

    it('should render avatar skeletons with correct accessibility label', () => {
      render(<CastCrewSkeleton count={2} />);

      const avatarSkeletons = screen.getAllByLabelText('Loading cast member');
      expect(avatarSkeletons).toHaveLength(2);
    });

    it('should render name skeletons with correct accessibility label', () => {
      render(<CastCrewSkeleton count={2} />);

      const nameSkeletons = screen.getAllByLabelText(
        'Loading cast member name',
      );
      expect(nameSkeletons).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle count of 0', () => {
      render(<CastCrewSkeleton count={0} />);

      const skeletonItems = screen.queryAllByTestId(/cast-crew-skeleton-item-/);
      expect(skeletonItems).toHaveLength(0);
    });

    it('should handle count of 1', () => {
      render(<CastCrewSkeleton count={1} />);

      const skeletonItems = screen.getAllByTestId(/cast-crew-skeleton-item-/);
      expect(skeletonItems).toHaveLength(1);
    });

    it('should handle large count values', () => {
      render(<CastCrewSkeleton count={10} />);

      const skeletonItems = screen.getAllByTestId(/cast-crew-skeleton-item-/);
      expect(skeletonItems).toHaveLength(10);
    });
  });

  describe('Component Structure', () => {
    it('should render container with correct testID', () => {
      const { getByTestId } = render(<CastCrewSkeleton />);

      expect(getByTestId('cast-crew-skeleton')).toBeTruthy();
    });

    it('should render all skeleton elements', () => {
      render(<CastCrewSkeleton count={2} />);

      expect(screen.getByTestId('cast-crew-skeleton')).toBeTruthy();
      expect(screen.getByTestId('cast-crew-skeleton-title')).toBeTruthy();
      expect(screen.getByTestId('cast-crew-skeleton-item-0')).toBeTruthy();
      expect(screen.getByTestId('cast-crew-skeleton-avatar-0')).toBeTruthy();
      expect(screen.getByTestId('cast-crew-skeleton-name-0')).toBeTruthy();
    });
  });
});
