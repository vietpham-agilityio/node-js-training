import { fireEvent, render } from '@testing-library/react-native';

// Constants
import { Size } from '@/constants/enum';

// Component
import { Button } from '..';

describe('Button Component', () => {
  const mockOnPress = jest.fn();
  const defaultProps = {
    title: 'Test Button',
    testID: 'test-button',
    onPress: mockOnPress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<Button {...defaultProps} />);
      expect(getByTestId('test-button')).toBeTruthy();
    });

    it('should display the correct title', () => {
      const { getByText } = render(<Button {...defaultProps} />);
      expect(getByText('Test Button')).toBeTruthy();
    });

    it('should render matching snapshot', () => {
      const { toJSON } = render(<Button {...defaultProps} />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Sizes', () => {
    it('should render with LARGE size by default', () => {
      const { getByTestId } = render(<Button {...defaultProps} />);
      const button = getByTestId('test-button');
      expect(button).toBeTruthy();
    });

    it('should render with EXTRA_SMALL size', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} size={Size.EXTRA_SMALL} />,
      );
      expect(getByTestId('test-button')).toBeTruthy();
    });

    it('should render with SMALL size', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} size={Size.SMALL} />,
      );
      expect(getByTestId('test-button')).toBeTruthy();
    });

    it('should render with MEDIUM size', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} size={Size.MEDIUM} />,
      );
      expect(getByTestId('test-button')).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('should render disabled state', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} disabled={true} />,
      );
      expect(getByTestId('test-button-text')).toBeTruthy();
    });

    it('should not call onPress when disabled', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} disabled={true} />,
      );
      const button = getByTestId('test-button');
      fireEvent.press(button);
      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when pressed', () => {
      const { getByTestId } = render(<Button {...defaultProps} />);
      const button = getByTestId('test-button');
      fireEvent.press(button);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should call onPress multiple times', () => {
      const { getByTestId } = render(<Button {...defaultProps} />);
      const button = getByTestId('test-button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });
});
