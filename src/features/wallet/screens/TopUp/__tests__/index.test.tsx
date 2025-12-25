import { fireEvent, render, waitFor } from '@testing-library/react-native';

import TopUpScreen from '../index';

// Mock dependencies
const mockPush = jest.fn();
const mockDismissAll = jest.fn();
const mockTopUp = jest.fn();
const mockShowError = jest.fn();

jest.mock('expo-router', () => ({
  Href: {},
  useRouter: () => ({
    push: mockPush,
    dismissAll: mockDismissAll,
  }),
}));

let mockIsPending = false;

jest.mock('@/features/wallet/hooks/useWallet', () => ({
  useTopUp: () => ({
    mutate: mockTopUp,
    isPending: mockIsPending,
  }),
}));

jest.mock('@/stores/toast', () => ({
  useToastStore: (selector: any) =>
    selector({
      showError: mockShowError,
    }),
}));

// Mock constants
jest.mock('@/constants', () => ({
  ERROR_MESSAGES: {
    TOP_UP_MIN_AMOUNT: 'Minimum top-up amount is IDR 10.000',
    TOP_UP_MAX_AMOUNT: 'Maximum top-up amount is IDR 10.000.000',
    TOP_UP_FAILED: 'Failed to top up wallet. Please try again.',
  },
  ROUTES: {
    PURCHASE_SUCCESS: '/(main)/purchase/purchase-success',
  },
  TOP_UP_AMOUNTS: [
    50000, 100000, 150000, 200000, 250000, 500000, 750000, 1000000,
  ],
  TOP_UP_MIN_AMOUNT: 10000,
  TOP_UP_MAX_AMOUNT: 10000000,
  Size: {
    LARGE: 'large',
  },
}));

// Mock utils
jest.mock('@/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

jest.mock('@/utils/formats', () => ({
  formatIDR: (amount: number, options?: { showCurrency?: boolean }) => {
    const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (options?.showCurrency === false) return formatted;
    return `IDR ${formatted}`;
  },
}));

describe('TopUpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPending = false;
  });

  describe('Rendering', () => {
    it('should render amount input', () => {
      const { getByTestId, getByText } = render(<TopUpScreen />);

      expect(getByTestId('top-up-amount-input-input')).toBeTruthy();
      expect(getByText('Amount')).toBeTruthy();
    });

    it('should render predefined amount buttons', () => {
      const { getByText } = render(<TopUpScreen />);

      expect(getByText('50.000')).toBeTruthy();
      expect(getByText('100.000')).toBeTruthy();
      expect(getByText('150.000')).toBeTruthy();
      expect(getByText('200.000')).toBeTruthy();
      expect(getByText('250.000')).toBeTruthy();
      expect(getByText('500.000')).toBeTruthy();
      expect(getByText('750.000')).toBeTruthy();
      expect(getByText('1.000.000')).toBeTruthy();
    });

    it('should render Top Up Now button', () => {
      const { getByText } = render(<TopUpScreen />);

      expect(getByText('Top Up Now')).toBeTruthy();
    });
  });

  describe('Amount Selection', () => {
    it('should select predefined amount when button is pressed', () => {
      const { getByText, getByTestId } = render(<TopUpScreen />);

      const amountButton = getByText('50.000').parent?.parent;
      if (amountButton) {
        fireEvent.press(amountButton);
      }

      const input = getByTestId('top-up-amount-input-input');
      expect(input.props.value).toBe('IDR 50.000');
    });

    it('should update input when manual amount is entered', () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '75000');

      expect(input.props.value).toBe('IDR 75.000');
    });

    it('should clear amount when input is cleared', () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '50000');
      fireEvent.changeText(input, '');

      expect(input.props.value).toBe('');
    });

    it('should match predefined amount when manual input equals predefined value', () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '100000');

      expect(input.props.value).toBe('IDR 100.000');
    });
  });

  describe('Validation', () => {
    it('should show error when amount is below minimum', () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '5000');

      expect(getByTestId('top-up-amount-input-error')).toBeTruthy();
    });

    it('should show error when amount is above maximum', () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '15000000');

      expect(getByTestId('top-up-amount-input-error')).toBeTruthy();
    });

    it('should clear error when valid amount is entered', () => {
      const { getByTestId, queryByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '5000');
      expect(getByTestId('top-up-amount-input-error')).toBeTruthy();

      fireEvent.changeText(input, '50000');
      expect(queryByTestId('top-up-amount-input-error')).toBeNull();
    });
  });

  describe('Top Up Button', () => {
    it('should be disabled when amount is empty', () => {
      const { getByTestId } = render(<TopUpScreen />);

      const button = getByTestId('top-up-button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should be disabled when amount is 0', () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '0');

      const button = getByTestId('top-up-button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should be disabled when there is an error', () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '5000');

      const button = getByTestId('top-up-button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should be enabled when valid amount is entered', () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '50000');

      const button = getByTestId('top-up-button');
      expect(button.props.accessibilityState?.disabled).toBe(false);
    });
  });

  describe('Top Up Action', () => {
    it('should call topUp mutation with correct amount', () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input');
      fireEvent.changeText(input, '50000');

      const button = getByTestId('top-up-button');
      fireEvent.press(button);

      expect(mockTopUp).toHaveBeenCalledWith(50000, expect.any(Object));
    });

    it('should navigate to purchase success on success', async () => {
      mockTopUp.mockImplementation((amount: number, options: any) => {
        options.onSuccess();
      });

      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input');
      fireEvent.changeText(input, '50000');

      const button = getByTestId('top-up-button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockDismissAll).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith(
          '/(main)/purchase/purchase-success',
        );
      });
    });

    it('should show error toast on failure', async () => {
      const error = new Error('Network error');
      mockTopUp.mockImplementation((amount: number, options: any) => {
        options.onError(error);
      });

      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input');
      fireEvent.changeText(input, '50000');

      const button = getByTestId('top-up-button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith('Network error');
      });
    });

    it('should show default error message when error has no message', async () => {
      const error = new Error('');
      mockTopUp.mockImplementation((amount: number, options: any) => {
        options.onError(error);
      });

      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input');
      fireEvent.changeText(input, '50000');

      const button = getByTestId('top-up-button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          'Failed to top up wallet. Please try again.',
        );
      });
    });

    it('should clear amount on success', async () => {
      mockTopUp.mockImplementation((amount: number, options: any) => {
        options.onSuccess();
      });

      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input');
      fireEvent.changeText(input, '50000');

      const button = getByTestId('top-up-button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(input.props.value).toBe(undefined);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility label for screen', () => {
      const { UNSAFE_getByType } = render(<TopUpScreen />);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { SafeAreaView } = require('react-native-safe-area-context');

      const safeAreaView = UNSAFE_getByType(SafeAreaView);
      expect(safeAreaView.props.accessibilityLabel).toBe(
        'Top up wallet screen',
      );
    });

    it('should have accessibility labels for predefined amount buttons', () => {
      const { getByText } = render(<TopUpScreen />);

      // Navigate up the tree to find the TouchableOpacity with accessibility props
      let amountButton = getByText('50.000').parent;
      while (amountButton && !amountButton.props.accessibilityRole) {
        amountButton = amountButton.parent;
      }
      expect(amountButton?.props.accessibilityRole).toBe('text');
    });
  });
});
