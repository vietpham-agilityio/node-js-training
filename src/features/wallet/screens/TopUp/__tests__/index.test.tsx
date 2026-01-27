// @/features/wallet/__tests__/TopUpScreen.test.tsx
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ReactNode } from 'react';

import TopUpScreen from '../index';

// Mock dependencies
const mockPush = jest.fn();
const mockDismissAll = jest.fn();
const mockTopUp = jest.fn();
const mockShowError = jest.fn();
const mockUseLocalSearchParams = jest.fn();

jest.mock('expo-router', () => ({
  Href: {},
  useRouter: () => ({
    push: mockPush,
    dismissAll: mockDismissAll,
  }),
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

let mockIsPending = false;

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: { children: ReactNode }) => children,
}));

// Mock KeyboardLayout
jest.mock('@/layouts/KeyboardLayout', () => ({
  KeyboardLayout: ({
    children,
    accessibilityLabel,
  }: {
    children: ReactNode;
    accessibilityLabel?: string;
  }) => {
    const { View } = require('react-native');
    return (
      <View testID="keyboard-layout" accessibilityLabel={accessibilityLabel}>
        {children}
      </View>
    );
  },
}));

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
  PARAMS: {
    FROM_CHECKOUT: 'fromCheckout',
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
    mockUseLocalSearchParams.mockReturnValue({});
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

  describe('Amount Selection with Effect', () => {
    it('should select predefined amount when button is pressed', async () => {
      const { getByText, getByTestId } = render(<TopUpScreen />);

      const amountButton = getByText('50.000').parent?.parent;
      if (amountButton) {
        fireEvent.press(amountButton);
      }

      await waitFor(() => {
        const input = getByTestId('top-up-amount-input-input');
        expect(input.props.value).toBe('IDR 50.000');
      });
    });

    it('should update input when manual amount is entered', async () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '75000');

      await waitFor(() => {
        expect(input.props.value).toBe('IDR 75.000');
      });
    });

    it('should clear amount when input is cleared', async () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '50000');

      await waitFor(() => {
        expect(input.props.value).toBe('IDR 50.000');
      });

      fireEvent.changeText(input, '');

      await waitFor(() => {
        expect(input.props.value).toBe('');
      });
    });

    it('should match predefined amount when manual input equals predefined value', async () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '100000');

      await waitFor(() => {
        expect(input.props.value).toBe('IDR 100.000');
      });
    });
  });

  describe('Validation with Effect', () => {
    it('should show error when amount is below minimum', async () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '5000');

      await waitFor(() => {
        expect(getByTestId('top-up-amount-input-error')).toBeTruthy();
      });
    });

    it('should show error when amount is above maximum', async () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '15000000');

      await waitFor(() => {
        expect(getByTestId('top-up-amount-input-error')).toBeTruthy();
      });
    });
  });

  describe('Top Up Button', () => {
    it('should be disabled when amount is empty', () => {
      const { getByTestId } = render(<TopUpScreen />);

      const button = getByTestId('top-up-button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should be disabled when amount is 0', async () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '0');

      await waitFor(() => {
        const button = getByTestId('top-up-button');
        expect(button.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('should be disabled when there is an error', async () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '5000');

      await waitFor(() => {
        const button = getByTestId('top-up-button');
        expect(button.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('should be enabled when valid amount is entered', async () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');
      fireEvent.changeText(input, '50000');

      await waitFor(() => {
        const button = getByTestId('top-up-button');
        expect(button.props.accessibilityState?.disabled).toBe(false);
      });
    });
  });

  describe('Top Up Action', () => {
    it('should call topUp mutation with correct amount', async () => {
      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input');
      fireEvent.changeText(input, '50000');

      await waitFor(() => {
        const button = getByTestId('top-up-button');
        expect(button.props.accessibilityState?.disabled).toBe(false);
      });

      const button = getByTestId('top-up-button');
      fireEvent.press(button);

      expect(mockTopUp).toHaveBeenCalledWith(50000, expect.any(Object));
    });

    it('should navigate to purchase success on success (not from checkout)', async () => {
      mockTopUp.mockImplementation((amount: number, options: any) => {
        options.onSuccess();
      });

      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input');
      fireEvent.changeText(input, '50000');

      await waitFor(() => {
        const button = getByTestId('top-up-button');
        expect(button.props.accessibilityState?.disabled).toBe(false);
      });

      const button = getByTestId('top-up-button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockDismissAll).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith(
          '/(main)/purchase/purchase-success',
        );
      });
    });

    it('should navigate to purchase success with fromCheckout param when from checkout', async () => {
      mockUseLocalSearchParams.mockReturnValue({ fromCheckout: 'true' });
      mockTopUp.mockImplementation((amount: number, options: any) => {
        options.onSuccess();
      });

      const { getByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input');
      fireEvent.changeText(input, '50000');

      await waitFor(() => {
        const button = getByTestId('top-up-button');
        expect(button.props.accessibilityState?.disabled).toBe(false);
      });

      const button = getByTestId('top-up-button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockDismissAll).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith(
          '/(main)/purchase/purchase-success?fromCheckout=true',
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

      await waitFor(() => {
        const button = getByTestId('top-up-button');
        expect(button.props.accessibilityState?.disabled).toBe(false);
      });

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

      await waitFor(() => {
        const button = getByTestId('top-up-button');
        expect(button.props.accessibilityState?.disabled).toBe(false);
      });

      const button = getByTestId('top-up-button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          'Failed to top up wallet. Please try again.',
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should render within KeyboardLayout', () => {
      const { getByTestId } = render(<TopUpScreen />);

      expect(getByTestId('keyboard-layout')).toBeTruthy();
    });
  });

  describe('Effect State Management', () => {
    it('should manage complex state transitions through Effect', async () => {
      const { getByText, getByTestId } = render(<TopUpScreen />);

      // Initial state
      const input = getByTestId('top-up-amount-input-input');
      expect(input.props.value).toBe('');

      // Select predefined amount
      const button50k = getByText('50.000').parent?.parent;
      if (button50k) {
        fireEvent.press(button50k);
      }

      await waitFor(() => {
        expect(input.props.value).toBe('IDR 50.000');
      });

      // Override with manual input
      fireEvent.changeText(input, '75000');

      await waitFor(() => {
        expect(input.props.value).toBe('IDR 75.000');
      });

      // Select different predefined amount
      const button100k = getByText('100.000').parent?.parent;
      if (button100k) {
        fireEvent.press(button100k);
      }

      await waitFor(() => {
        expect(input.props.value).toBe('IDR 100.000');
      });
    });

    it('should handle validation errors through Effect pipeline', async () => {
      const { getByTestId, queryByTestId } = render(<TopUpScreen />);

      const input = getByTestId('top-up-amount-input-input');

      // Below minimum
      fireEvent.changeText(input, '5000');

      await waitFor(() => {
        expect(getByTestId('top-up-amount-input-error')).toBeTruthy();
      });

      // Above maximum
      fireEvent.changeText(input, '15000000');

      await waitFor(() => {
        expect(getByTestId('top-up-amount-input-error')).toBeTruthy();
      });

      // Valid amount
      fireEvent.changeText(input, '100000');

      await waitFor(() => {
        expect(queryByTestId('top-up-amount-input-error')).toBeNull();
      });
    });
  });
});
