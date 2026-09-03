import { render, screen } from '@testing-library/react-native';

// Components
import { WalletCardSkeleton } from '../';

describe('WalletCardSkeleton', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<WalletCardSkeleton />);
      expect(getByTestId('wallet-card-skeleton')).toBeTruthy();
    });

    it('should render with correct testID', () => {
      const { getByTestId } = render(<WalletCardSkeleton />);
      expect(getByTestId('wallet-card-skeleton')).toBeTruthy();
    });
  });

  describe('Skeleton Element', () => {
    it('should render main skeleton element', () => {
      const { getByTestId } = render(<WalletCardSkeleton />);
      expect(getByTestId('wallet-card-skeleton-main')).toBeTruthy();
    });

    it('should render main skeleton with correct accessibility label', () => {
      const { getAllByLabelText } = render(<WalletCardSkeleton />);
      const skeletons = getAllByLabelText('Loading wallet card');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Component Structure', () => {
    it('should render container with correct testID', () => {
      const { getByTestId } = render(<WalletCardSkeleton />);
      expect(getByTestId('wallet-card-skeleton')).toBeTruthy();
    });

    it('should render all skeleton elements', () => {
      render(<WalletCardSkeleton />);

      expect(screen.getByTestId('wallet-card-skeleton')).toBeTruthy();
      expect(screen.getByTestId('wallet-card-skeleton-main')).toBeTruthy();
    });
  });
});
