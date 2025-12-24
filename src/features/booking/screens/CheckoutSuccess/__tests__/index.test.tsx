import { fireEvent, render } from '@testing-library/react-native';

import CheckoutSuccessScreen from '../index';

// Mock dependencies
const mockReplace = jest.fn();
const mockRemoveSeat = jest.fn();

let mockSelectedSeats = ['A1', 'A2', 'A3'];

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

const mockUseBookingStore = jest.fn((selector: any) =>
  selector({
    selectedSeats: mockSelectedSeats,
    removeSeat: mockRemoveSeat,
  }),
);

jest.mock('@/features/booking/store/booking', () => ({
  useBookingStore: (selector: any) => mockUseBookingStore(selector),
}));

// Mock components
jest.mock('@/components/ConfirmationState', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require('react-native');
  return {
    ConfirmationState: ({ icon, title, description }: any) =>
      React.createElement(
        View,
        { testID: 'confirmation-state' },
        React.createElement(Text, { testID: 'confirmation-title' }, title),
        React.createElement(
          Text,
          { testID: 'confirmation-description' },
          description,
        ),
        icon,
      ),
  };
});

jest.mock('@/components/Button', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: ({
      title,
      onPress,
      isPrimary,
      accessible,
      accessibilityRole,
      accessibilityLabel,
      accessibilityHint,
      testID,
    }: any) =>
      React.createElement(
        TouchableOpacity,
        {
          onPress,
          accessible,
          accessibilityRole,
          accessibilityLabel,
          accessibilityHint,
          testID: testID || 'button',
        },
        React.createElement(Text, null, title),
      ),
  };
});

jest.mock('@/components/Typo', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require('react-native');
  return {
    Typo: ({ children, weight, size, className, testID }: any) =>
      React.createElement(
        Text,
        { testID, className, 'data-weight': weight, 'data-size': size },
        children,
      ),
  };
});

jest.mock('@/icons/TicketCheckedIcon', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    TicketCheckedIcon: () =>
      React.createElement(View, { testID: 'ticket-checked-icon' }),
  };
});

// Mock constants
jest.mock('@/constants', () => ({
  MESSAGES: {
    CHECKOUT_SUCCESS_TITLE: 'Booking Confirmed!',
    CHECKOUT_SUCCESS_DESCRIPTION: 'Your tickets have been successfully booked.',
  },
  ROUTES: {
    MY_TICKET: '/my-ticket',
    HOME: '/home',
  },
}));

describe('CheckoutSuccessScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectedSeats = ['A1', 'A2', 'A3'];
    mockUseBookingStore.mockImplementation((selector: any) =>
      selector({
        selectedSeats: mockSelectedSeats,
        removeSeat: mockRemoveSeat,
      }),
    );
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<CheckoutSuccessScreen />);
      expect(getByTestId('confirmation-state')).toBeTruthy();
    });

    it('should render ConfirmationState with correct props', () => {
      const { getByTestId, getByText } = render(<CheckoutSuccessScreen />);

      expect(getByTestId('confirmation-state')).toBeTruthy();
      expect(getByText('Booking Confirmed!')).toBeTruthy();
      expect(
        getByText('Your tickets have been successfully booked.'),
      ).toBeTruthy();
    });

    it('should render "My Ticket" button', () => {
      const { getByText } = render(<CheckoutSuccessScreen />);
      expect(getByText('My Ticket')).toBeTruthy();
    });

    it('should render "Back to home" link', () => {
      const { getByText } = render(<CheckoutSuccessScreen />);
      expect(getByText('Discover new movies?')).toBeTruthy();
      expect(getByText('Back to home')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to MY_TICKET when "My Ticket" button is pressed', () => {
      const { getByText } = render(<CheckoutSuccessScreen />);
      const button = getByText('My Ticket').parent;

      fireEvent.press(button!);

      expect(mockReplace).toHaveBeenCalledWith('/my-ticket');
    });

    it('should navigate to HOME when "Back to home" is pressed', () => {
      const { getByText } = render(<CheckoutSuccessScreen />);
      const pressable = getByText('Back to home').parent;

      fireEvent.press(pressable!);

      expect(mockReplace).toHaveBeenCalledWith('/home');
    });
  });

  describe('Seat Clearing', () => {
    it('should clear all seats when "My Ticket" button is pressed', () => {
      const { getByText } = render(<CheckoutSuccessScreen />);
      const button = getByText('My Ticket').parent;

      fireEvent.press(button!);

      // Should call removeSeat for each selected seat
      expect(mockRemoveSeat).toHaveBeenCalledTimes(3);
      expect(mockRemoveSeat).toHaveBeenCalledWith('A1');
      expect(mockRemoveSeat).toHaveBeenCalledWith('A2');
      expect(mockRemoveSeat).toHaveBeenCalledWith('A3');
    });

    it('should clear all seats when "Back to home" is pressed', () => {
      const { getByText } = render(<CheckoutSuccessScreen />);
      const pressable = getByText('Back to home').parent;

      fireEvent.press(pressable!);

      // Should call removeSeat for each selected seat
      expect(mockRemoveSeat).toHaveBeenCalledTimes(3);
      expect(mockRemoveSeat).toHaveBeenCalledWith('A1');
      expect(mockRemoveSeat).toHaveBeenCalledWith('A2');
      expect(mockRemoveSeat).toHaveBeenCalledWith('A3');
    });

    it('should handle empty seats array gracefully', () => {
      mockSelectedSeats = [];
      mockUseBookingStore.mockImplementationOnce((selector: any) =>
        selector({
          selectedSeats: [],
          removeSeat: mockRemoveSeat,
        }),
      );

      const { getByText } = render(<CheckoutSuccessScreen />);
      const button = getByText('My Ticket').parent;

      fireEvent.press(button!);

      // Should not call removeSeat when seats array is empty
      expect(mockRemoveSeat).not.toHaveBeenCalled();
      // But should still navigate
      expect(mockReplace).toHaveBeenCalledWith('/my-ticket');
    });

    it('should handle single seat', () => {
      mockSelectedSeats = ['B5'];
      mockUseBookingStore.mockImplementationOnce((selector: any) =>
        selector({
          selectedSeats: ['B5'],
          removeSeat: mockRemoveSeat,
        }),
      );

      const { getByText } = render(<CheckoutSuccessScreen />);
      const button = getByText('My Ticket').parent;

      fireEvent.press(button!);

      expect(mockRemoveSeat).toHaveBeenCalledTimes(1);
      expect(mockRemoveSeat).toHaveBeenCalledWith('B5');
    });
  });
});
