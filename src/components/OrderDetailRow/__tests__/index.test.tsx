import { render, screen } from '@testing-library/react-native';

// Component
import { OrderDetailRow } from '..';

describe('OrderDetailRow Component', () => {
  const defaultProps = {
    label: 'Test Label',
    value: 'Test Value',
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<OrderDetailRow {...defaultProps} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should display the label', () => {
      render(<OrderDetailRow {...defaultProps} />);
      expect(screen.getByText('Test Label')).toBeTruthy();
    });

    it('should display the value', () => {
      render(<OrderDetailRow {...defaultProps} />);
      expect(screen.getByText('Test Value')).toBeTruthy();
    });

    it('should render with testID', () => {
      render(<OrderDetailRow {...defaultProps} testID="test-order-row" />);
      expect(screen.getByTestId('test-order-row')).toBeTruthy();
    });
  });

  describe('Props', () => {
    it('should render with different label', () => {
      render(<OrderDetailRow label="ID Order" value="22081996" />);
      expect(screen.getByText('ID Order')).toBeTruthy();
      expect(screen.getByText('22081996')).toBeTruthy();
    });

    it('should render with different value', () => {
      render(<OrderDetailRow label="Price" value="Rp 50.000" />);
      expect(screen.getByText('Price')).toBeTruthy();
      expect(screen.getByText('Rp 50.000')).toBeTruthy();
    });

    it('should apply custom value className', () => {
      render(
        <OrderDetailRow {...defaultProps} valueClassName="text-light-blue" />,
      );
      const valueElement = screen.getByText('Test Value');
      expect(valueElement.props.className).toContain('text-light-blue');
    });

    it('should apply multiple custom value classNames', () => {
      render(
        <OrderDetailRow
          {...defaultProps}
          valueClassName="text-primary font-montserrat-semibold"
        />,
      );
      const valueElement = screen.getByText('Test Value');
      expect(valueElement.props.className).toContain('text-primary');
      expect(valueElement.props.className).toContain(
        'font-montserrat-semibold',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty label', () => {
      render(<OrderDetailRow label="" value="Test Value" />);
      expect(screen.getByText('Test Value')).toBeTruthy();
    });

    it('should handle empty value', () => {
      render(<OrderDetailRow label="Test Label" value="" />);
      expect(screen.getByText('Test Label')).toBeTruthy();
    });

    it('should handle long labels', () => {
      const longLabel =
        'This is a very long label that should be displayed correctly';
      render(<OrderDetailRow label={longLabel} value="Value" />);
      expect(screen.getByText(longLabel)).toBeTruthy();
    });

    it('should handle long values', () => {
      const longValue =
        'This is a very long value that should be displayed correctly';
      render(<OrderDetailRow label="Label" value={longValue} />);
      expect(screen.getByText(longValue)).toBeTruthy();
    });

    it('should handle numeric values', () => {
      render(<OrderDetailRow label="Quantity" value="3" />);
      expect(screen.getByText('Quantity')).toBeTruthy();
      expect(screen.getByText('3')).toBeTruthy();
    });

    it('should handle special characters in value', () => {
      render(<OrderDetailRow label="Price" value="Rp 50.000 x 3" />);
      expect(screen.getByText('Price')).toBeTruthy();
      expect(screen.getByText('Rp 50.000 x 3')).toBeTruthy();
    });
  });
});
