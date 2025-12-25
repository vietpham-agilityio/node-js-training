import { fireEvent, render } from '@testing-library/react-native';

import PurchaseSuccessScreen from '../index';

// Constants
import { ROUTES, MESSAGES } from '@/constants';

// Mock dependencies
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe('PurchaseSuccessScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render confirmation state with correct title and description', () => {
      const { getByTestId, getByText } = render(<PurchaseSuccessScreen />);

      expect(getByTestId('confirmation-state')).toBeTruthy();
      expect(getByText(MESSAGES.PURCHASE_SUCCESS_TITLE)).toBeTruthy();
      expect(getByText(MESSAGES.PURCHASE_SUCCESS_DESCRIPTION)).toBeTruthy();
    });

    it('should render My Wallet button', () => {
      const { getByText } = render(<PurchaseSuccessScreen />);

      expect(getByText('My Wallet')).toBeTruthy();
    });

    it('should render Back to home link', () => {
      const { getByText } = render(<PurchaseSuccessScreen />);

      expect(getByText('Discover new movies?')).toBeTruthy();
      expect(getByText('Back to home')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to My Wallet when button is pressed', () => {
      const { getByTestId } = render(<PurchaseSuccessScreen />);

      const button = getByTestId('my-wallet-text');
      fireEvent.press(button);

      expect(mockReplace).toHaveBeenCalledWith(ROUTES.MY_WALLET);
    });

    it('should navigate to Home when Back to home is pressed', () => {
      const { getByText } = render(<PurchaseSuccessScreen />);

      const backToHomeLink = getByText('Back to home');
      fireEvent.press(backToHomeLink);

      expect(mockReplace).toHaveBeenCalledWith(ROUTES.HOME);
    });
  });
});
