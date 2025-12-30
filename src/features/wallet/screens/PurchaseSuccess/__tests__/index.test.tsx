import { fireEvent, render } from '@testing-library/react-native';

import PurchaseSuccessScreen from '../index';

// Constants
import { MESSAGES, ROUTES } from '@/constants';

// Mock dependencies
const mockReplace = jest.fn();
const mockUseLocalSearchParams = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

describe('PurchaseSuccessScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: not from checkout
    mockUseLocalSearchParams.mockReturnValue({});
  });

  describe('Rendering', () => {
    it('should render confirmation state with correct title and description', () => {
      const { getByTestId, getByText } = render(<PurchaseSuccessScreen />);

      expect(getByTestId('confirmation-state')).toBeTruthy();
      expect(getByText(MESSAGES.PURCHASE_SUCCESS_TITLE)).toBeTruthy();
      expect(getByText(MESSAGES.PURCHASE_SUCCESS_DESCRIPTION)).toBeTruthy();
    });

    it('should render My Wallet button when not from checkout', () => {
      const { getByText } = render(<PurchaseSuccessScreen />);

      expect(getByText('My Wallet')).toBeTruthy();
    });

    it('should render Checkout Now button when from checkout', () => {
      mockUseLocalSearchParams.mockReturnValue({ fromCheckout: 'true' });

      const { getByText, queryByText } = render(<PurchaseSuccessScreen />);

      expect(getByText('Checkout Now')).toBeTruthy();
      expect(queryByText('My Wallet')).toBeNull();
    });

    it('should render Back to home link', () => {
      const { getByText } = render(<PurchaseSuccessScreen />);

      expect(getByText('Discover new movies?')).toBeTruthy();
      expect(getByText('Back to home')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to My Wallet when button is pressed (not from checkout)', () => {
      const { getByTestId } = render(<PurchaseSuccessScreen />);

      const button = getByTestId('my-wallet-text');
      fireEvent.press(button);

      expect(mockReplace).toHaveBeenCalledWith(ROUTES.MY_WALLET);
    });

    it('should navigate to Checkout when button is pressed (from checkout)', () => {
      mockUseLocalSearchParams.mockReturnValue({ fromCheckout: 'true' });

      const { getByTestId } = render(<PurchaseSuccessScreen />);

      const button = getByTestId('checkout-now-text');
      fireEvent.press(button);

      expect(mockReplace).toHaveBeenCalledWith(ROUTES.CHECKOUT);
    });

    it('should navigate to Home when Back to home is pressed', () => {
      const { getByText } = render(<PurchaseSuccessScreen />);

      const backToHomeLink = getByText('Back to home');
      fireEvent.press(backToHomeLink);

      expect(mockReplace).toHaveBeenCalledWith(ROUTES.HOME);
    });
  });

  describe('fromCheckout param handling', () => {
    it('should show My Wallet when fromCheckout is undefined', () => {
      mockUseLocalSearchParams.mockReturnValue({});

      const { getByText } = render(<PurchaseSuccessScreen />);

      expect(getByText('My Wallet')).toBeTruthy();
    });

    it('should show My Wallet when fromCheckout is false string', () => {
      mockUseLocalSearchParams.mockReturnValue({ fromCheckout: 'false' });

      const { getByText } = render(<PurchaseSuccessScreen />);

      expect(getByText('My Wallet')).toBeTruthy();
    });

    it('should show Checkout Now only when fromCheckout is true string', () => {
      mockUseLocalSearchParams.mockReturnValue({ fromCheckout: 'true' });

      const { getByText } = render(<PurchaseSuccessScreen />);

      expect(getByText('Checkout Now')).toBeTruthy();
    });
  });
});
