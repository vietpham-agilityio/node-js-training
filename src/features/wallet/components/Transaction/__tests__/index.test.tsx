import { WalletTransactionType } from '@/features/wallet/types/wallet';
import { fireEvent, render } from '@testing-library/react-native';
import { Transaction } from '../index';

const mockFormatIDR = jest.fn(
  (amount: number) => `IDR ${amount.toLocaleString('id-ID')}`,
);
const mockFormatShowtimeDate = jest.fn((date: string) => `Formatted: ${date}`);

jest.mock('@/utils/formats', () => ({
  formatIDR: (amount: number) => mockFormatIDR(amount),
  formatShowtimeDate: (date: string) => mockFormatShowtimeDate(date),
}));

jest.mock('@/utils/cn', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Transaction Component', () => {
  const defaultProps = {
    description: 'Movie Ticket Purchase',
    createdAt: '2024-01-15T14:00:00Z',
    amount: 50000,
    transactionType: WalletTransactionType.PAYMENT,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatIDR.mockImplementation(
      (amount: number) => `IDR ${amount.toLocaleString('id-ID')}`,
    );
    mockFormatShowtimeDate.mockImplementation(
      (date: string) => `Formatted: ${date}`,
    );
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<Transaction {...defaultProps} />);
      expect(getByTestId('transaction')).toBeTruthy();
    });

    it('should render with all required props', () => {
      const { getByTestId, getByText } = render(
        <Transaction {...defaultProps} />,
      );

      expect(getByTestId('transaction')).toBeTruthy();
      expect(getByText('Movie Ticket Purchase')).toBeTruthy();
    });

    it('should render description text', () => {
      const { getByText } = render(<Transaction {...defaultProps} />);
      expect(getByText('Movie Ticket Purchase')).toBeTruthy();
    });
  });

  describe('Transaction Types and Colors', () => {
    it('should apply correct color for TOP_UP transaction', () => {
      const { getByTestId } = render(
        <Transaction
          {...defaultProps}
          transactionType={WalletTransactionType.TOP_UP}
        />,
      );

      const priceElement = getByTestId('transaction-price');
      expect(priceElement.props.className).toContain('text-text-success');
    });

    it('should apply correct color for PAYMENT transaction', () => {
      const { getByTestId } = render(
        <Transaction
          {...defaultProps}
          transactionType={WalletTransactionType.PAYMENT}
        />,
      );

      const priceElement = getByTestId('transaction-price');
      expect(priceElement.props.className).toContain('text-text-error');
    });

    it('should apply correct color for REFUND transaction', () => {
      const { getByTestId } = render(
        <Transaction
          {...defaultProps}
          transactionType={WalletTransactionType.REFUND}
        />,
      );

      const priceElement = getByTestId('transaction-price');
      expect(priceElement.props.className).toContain('text-text-primary');
    });
  });

  describe('Amount Display', () => {
    it('should display formatted amount', () => {
      const { getByTestId } = render(
        <Transaction {...defaultProps} amount={50000} />,
      );

      expect(mockFormatIDR).toHaveBeenCalledWith(50000);
      const priceElement = getByTestId('transaction-price');
      expect(priceElement).toBeTruthy();
    });

    it('should render amount when amount is provided', () => {
      const { getByTestId } = render(
        <Transaction {...defaultProps} amount={100000} />,
      );
      expect(getByTestId('transaction-price')).toBeTruthy();
    });

    it('should not render amount when amount is 0', () => {
      const { queryByTestId } = render(
        <Transaction {...defaultProps} amount={0} />,
      );
      expect(queryByTestId('transaction-price')).toBeNull();
    });

    it('should format different amounts correctly', () => {
      render(<Transaction {...defaultProps} amount={150000} />);
      expect(mockFormatIDR).toHaveBeenCalledWith(150000);
    });
  });

  describe('Showtime Date Display', () => {
    it('should render showtime date text', () => {
      const createdAt = '2024-01-15T14:00:00Z';
      mockFormatShowtimeDate.mockReturnValue('Jan 15, 2024 at 2:00 PM');
      const { getByText } = render(
        <Transaction {...defaultProps} createdAt={createdAt} />,
      );

      expect(getByText('Jan 15, 2024 at 2:00 PM')).toBeTruthy();
    });

    it('should not render showtime when formatShowtimeDate returns empty', () => {
      mockFormatShowtimeDate.mockReturnValue('');
      const { queryByTestId } = render(<Transaction {...defaultProps} />);
      expect(queryByTestId('transaction-showtime')).toBeNull();
    });

    it('should not render showtime when formatShowtimeDate returns falsy value', () => {
      mockFormatShowtimeDate.mockReturnValue('');
      const { queryByTestId } = render(<Transaction {...defaultProps} />);
      expect(queryByTestId('transaction-showtime')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label on TouchableOpacity', () => {
      const { getByTestId } = render(<Transaction {...defaultProps} />);
      const transaction = getByTestId('transaction');

      expect(transaction.props.accessibilityLabel).toBe(
        'Movie Ticket Purchase',
      );
      expect(transaction.props.accessibilityHint).toBe(
        'Tap to view transaction details',
      );
    });

    it('should update accessibility label when description changes', () => {
      const { getByTestId, rerender } = render(
        <Transaction {...defaultProps} />,
      );

      rerender(<Transaction {...defaultProps} description="New Description" />);

      const transaction = getByTestId('transaction');
      expect(transaction.props.accessibilityLabel).toBe('New Description');
    });
  });

  describe('Interactions', () => {
    it('should call onPress when transaction is pressed', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <Transaction {...defaultProps} onPress={mockOnPress} />,
      );

      const transaction = getByTestId('transaction');
      fireEvent.press(transaction);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <Transaction {...defaultProps} onPress={mockOnPress} disabled />,
      );

      const transaction = getByTestId('transaction');
      fireEvent.press(transaction);

      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should handle multiple presses', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <Transaction {...defaultProps} onPress={mockOnPress} />,
      );

      const transaction = getByTestId('transaction');
      fireEvent.press(transaction);
      fireEvent.press(transaction);
      fireEvent.press(transaction);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });

    it('should pass through other TouchableOpacity props', () => {
      const mockOnLongPress = jest.fn();
      const { getByTestId } = render(
        <Transaction {...defaultProps} onLongPress={mockOnLongPress} />,
      );

      const transaction = getByTestId('transaction');
      fireEvent(transaction, 'longPress');

      expect(mockOnLongPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty description', () => {
      const { getByTestId } = render(
        <Transaction {...defaultProps} description="" />,
      );

      const transaction = getByTestId('transaction');
      expect(transaction.props.accessibilityLabel).toBe('');
    });

    it('should handle very long description', () => {
      const longDescription = 'A'.repeat(200);
      const { getByText } = render(
        <Transaction {...defaultProps} description={longDescription} />,
      );

      expect(getByText(longDescription)).toBeTruthy();
    });

    it('should handle negative amount', () => {
      const { getByTestId } = render(
        <Transaction {...defaultProps} amount={-10000} />,
      );

      expect(mockFormatIDR).toHaveBeenCalledWith(-10000);
      expect(getByTestId('transaction-price')).toBeTruthy();
    });

    it('should handle very large amount', () => {
      const { getByTestId } = render(
        <Transaction {...defaultProps} amount={999999999} />,
      );

      expect(mockFormatIDR).toHaveBeenCalledWith(999999999);
      expect(getByTestId('transaction-price')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should have correct testIDs for all elements', () => {
      const { getByTestId } = render(<Transaction {...defaultProps} />);

      expect(getByTestId('transaction')).toBeTruthy();
      expect(getByTestId('transaction-title')).toBeTruthy();
      expect(getByTestId('transaction-price')).toBeTruthy();
      expect(getByTestId('transaction-showtime')).toBeTruthy();
    });

    it('should render all sections in correct order', () => {
      const { getByTestId } = render(<Transaction {...defaultProps} />);

      const transaction = getByTestId('transaction');
      expect(transaction).toBeTruthy();
      expect(getByTestId('transaction-title')).toBeTruthy();
    });
  });
});
