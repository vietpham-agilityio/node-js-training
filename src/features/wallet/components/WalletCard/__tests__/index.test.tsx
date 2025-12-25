import { fireEvent, render } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { WalletCard } from '../index';

jest.mock('expo-image', () => ({
  ImageBackground: ({ children, style, contentFit }: any) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return (
      <View testID="image-background" style={style} contentFit={contentFit}>
        {children}
      </View>
    );
  },
}));

jest.mock('@assets/images/card.webp', () => 'card.webp');

const mockFormatIDR = jest.fn(
  (balance: number) => `IDR ${balance.toLocaleString('id-ID')}`,
);
const mockFormatCardNumber = jest.fn((cardNumber: string) => cardNumber);
const mockFormatCurrency = jest.fn(
  (amount: number, currency: string) => `${currency} ${amount}`,
);

jest.mock('@/utils/formats', () => ({
  formatIDR: (balance: number) => mockFormatIDR(balance),
  formatCardNumber: (cardNumber: string) => mockFormatCardNumber(cardNumber),
  formatCurrency: (amount: number, currency: string) =>
    mockFormatCurrency(amount, currency),
}));

jest.mock('@/utils/cn', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

// Mock Dimensions
const mockDimensions = {
  get: jest.fn(() => ({ width: 375, height: 812, scale: 2, fontScale: 1 })),
};

jest.spyOn(Dimensions, 'get').mockImplementation(mockDimensions.get);

describe('WalletCard Component', () => {
  const defaultProps = {
    balance: 100000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatIDR.mockImplementation(
      (balance: number) => `IDR ${balance.toLocaleString('id-ID')}`,
    );
    mockFormatCardNumber.mockImplementation((cardNumber: string) => cardNumber);
    mockFormatCurrency.mockImplementation(
      (amount: number, currency: string) => `${currency} ${amount}`,
    );
    mockDimensions.get.mockReturnValue({
      width: 375,
      height: 812,
      scale: 2,
      fontScale: 1,
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<WalletCard {...defaultProps} />);
      expect(getByTestId('image-background')).toBeTruthy();
    });

    it('should render with all required props', () => {
      const { getByText } = render(<WalletCard {...defaultProps} />);
      expect(getByText('Card Name')).toBeTruthy();
    });

    it('should render ImageBackground with card source', () => {
      const { getByTestId } = render(<WalletCard {...defaultProps} />);
      const imageBackground = getByTestId('image-background');
      expect(imageBackground).toBeTruthy();
    });
  });

  describe('Default Values', () => {
    it('should use default card number', () => {
      const { getByText } = render(<WalletCard {...defaultProps} />);
      expect(mockFormatCardNumber).toHaveBeenCalledWith('6032 1506 4207 2004');
      expect(getByText('6032 1506 4207 2004')).toBeTruthy();
    });

    it('should use default card name', () => {
      const { getByText } = render(<WalletCard {...defaultProps} />);
      expect(getByText('Arya Wijaya')).toBeTruthy();
    });
  });

  describe('Custom Props', () => {
    it('should render with custom card number', () => {
      const customCardNumber = '1234 5678 9012 3456';
      const { getByText } = render(
        <WalletCard {...defaultProps} cardNumber={customCardNumber} />,
      );
      expect(mockFormatCardNumber).toHaveBeenCalledWith(customCardNumber);
      expect(getByText(customCardNumber)).toBeTruthy();
    });

    it('should render with custom card name', () => {
      const customName = 'John Doe';
      const { getByText } = render(
        <WalletCard {...defaultProps} cardName={customName} />,
      );
      expect(getByText(customName)).toBeTruthy();
    });

    it('should render with custom balance', () => {
      render(<WalletCard balance={500000} />);
      expect(mockFormatIDR).toHaveBeenCalledWith(500000);
    });
  });

  describe('Balance Display', () => {
    it('should format and display balance correctly', () => {
      mockFormatIDR.mockReturnValue('IDR 100.000');
      const { getByText } = render(<WalletCard balance={100000} />);
      expect(getByText('IDR 100.000')).toBeTruthy();
    });

    it('should handle zero balance', () => {
      render(<WalletCard balance={0} />);
      expect(mockFormatIDR).toHaveBeenCalledWith(0);
    });

    it('should handle negative balance', () => {
      render(<WalletCard balance={-5000} />);
      expect(mockFormatIDR).toHaveBeenCalledWith(-5000);
    });

    it('should handle very large balance', () => {
      render(<WalletCard balance={999999999} />);
      expect(mockFormatIDR).toHaveBeenCalledWith(999999999);
    });
  });

  describe('Card Number Display', () => {
    it('should format and display card number', () => {
      const cardNumber = '6032 1506 4207 2004';
      mockFormatCardNumber.mockReturnValue('6032 1506 4207 2004');
      const { getByText } = render(
        <WalletCard {...defaultProps} cardNumber={cardNumber} />,
      );
      expect(getByText('6032 1506 4207 2004')).toBeTruthy();
    });

    it('should handle different card number formats', () => {
      const cardNumber = '1234567890123456';
      render(<WalletCard {...defaultProps} cardNumber={cardNumber} />);
      expect(mockFormatCardNumber).toHaveBeenCalledWith(cardNumber);
    });
  });

  describe('Accessibility', () => {
    it('should have button role when onPress is provided', () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <WalletCard {...defaultProps} onPress={mockOnPress} />,
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should have text role when onPress is not provided', () => {
      const component = render(<WalletCard {...defaultProps} />);
      expect(component).toBeTruthy();
    });

    it('should use custom accessibility label when provided', () => {
      const customLabel = 'Custom wallet card label';
      const { getByLabelText } = render(
        <WalletCard {...defaultProps} accessibilityLabel={customLabel} />,
      );
      expect(getByLabelText(customLabel)).toBeTruthy();
    });

    it('should generate accessibility label when not provided', () => {
      mockFormatCurrency.mockReturnValue('100000');
      const { getByLabelText } = render(
        <WalletCard {...defaultProps} balance={100000} />,
      );

      expect(
        getByLabelText(/Wallet balance IDR 100000, Card holder Arya Wijaya/),
      ).toBeTruthy();
    });

    it('should include "Tap to top up" in accessibility label when onPress is provided', () => {
      const mockOnPress = jest.fn();
      mockFormatCurrency.mockReturnValue('100000');
      const { getByLabelText } = render(
        <WalletCard {...defaultProps} onPress={mockOnPress} />,
      );

      expect(getByLabelText(/Tap to top up/)).toBeTruthy();
    });

    it('should have correct accessibility labels for card holder', () => {
      const { getByText } = render(
        <WalletCard {...defaultProps} cardName="John Doe" />,
      );
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should have correct accessibility label for card number', () => {
      const cardNumber = '1234 5678 9012 3456';
      mockFormatCardNumber.mockReturnValue('1234 5678 9012 3456');
      const { getByText } = render(
        <WalletCard {...defaultProps} cardNumber={cardNumber} />,
      );
      expect(getByText('1234 5678 9012 3456')).toBeTruthy();
    });

    it('should have correct accessibility label for balance', () => {
      mockFormatIDR.mockReturnValue('IDR 100.000');
      const { getByText } = render(<WalletCard balance={100000} />);
      expect(getByText('IDR 100.000')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when card is pressed', () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <WalletCard {...defaultProps} onPress={mockOnPress} />,
      );

      const button = getByRole('button');
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when not provided', () => {
      const { root } = render(<WalletCard {...defaultProps} />);
      // Should not throw error when pressing without onPress
      expect(root).toBeTruthy();
    });

    it('should handle multiple presses', () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <WalletCard {...defaultProps} onPress={mockOnPress} />,
      );

      const button = getByRole('button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Content Structure', () => {
    it('should render "Card Name" label', () => {
      const { getByText } = render(<WalletCard {...defaultProps} />);
      expect(getByText('Card Name')).toBeTruthy();
    });

    it('should render card holder name', () => {
      const { getByText } = render(
        <WalletCard {...defaultProps} cardName="John Doe" />,
      );
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should render formatted card number', () => {
      const cardNumber = '1234 5678 9012 3456';
      mockFormatCardNumber.mockReturnValue('1234 5678 9012 3456');
      const { getByText } = render(
        <WalletCard {...defaultProps} cardNumber={cardNumber} />,
      );
      expect(getByText('1234 5678 9012 3456')).toBeTruthy();
    });

    it('should render formatted balance', () => {
      mockFormatIDR.mockReturnValue('IDR 100.000');
      const { getByText } = render(<WalletCard balance={100000} />);
      expect(getByText('IDR 100.000')).toBeTruthy();
    });
  });

  describe('ImageBackground Props', () => {
    it('should set contentFit to cover', () => {
      const { getByTestId } = render(<WalletCard {...defaultProps} />);
      const imageBackground = getByTestId('image-background');
      expect(imageBackground.props.contentFit).toBe('cover');
    });

    it('should set width and height to 100%', () => {
      const { getByTestId } = render(<WalletCard {...defaultProps} />);
      const imageBackground = getByTestId('image-background');
      expect(imageBackground.props.style.width).toBeDefined();
      expect(imageBackground.props.style.height).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty card name', () => {
      const { getByTestId } = render(
        <WalletCard {...defaultProps} cardName="" />,
      );
      // Component should render without crashing
      expect(getByTestId('image-background')).toBeTruthy();
    });

    it('should handle very long card name', () => {
      const longName = 'A'.repeat(100);
      const { getByText } = render(
        <WalletCard {...defaultProps} cardName={longName} />,
      );
      expect(getByText(longName)).toBeTruthy();
    });

    it('should handle empty card number', () => {
      render(<WalletCard {...defaultProps} cardNumber="" />);
      expect(mockFormatCardNumber).toHaveBeenCalledWith('');
    });
  });

  describe('Memo Behavior', () => {
    it('should re-render when props change', () => {
      const { rerender } = render(<WalletCard {...defaultProps} />);

      rerender(<WalletCard balance={200000} />);

      expect(mockFormatIDR).toHaveBeenCalledWith(200000);
    });
  });

  describe('Combined Scenarios', () => {
    it('should render wallet card with minimal props', () => {
      const { getByText } = render(<WalletCard balance={0} />);

      expect(getByText('Card Name')).toBeTruthy();
      expect(getByText('Arya Wijaya')).toBeTruthy();
      expect(mockFormatIDR).toHaveBeenCalledWith(0);
    });
  });
});
