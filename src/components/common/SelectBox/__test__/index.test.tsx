import { fireEvent, render } from '@testing-library/react-native';

// Component
import { SelectBox } from '../';

describe('SelectBox Component', () => {
  const mockOnPress = jest.fn();
  const defaultProps = {
    value: 'Test Value',
    testID: 'test-select-box',
    onPress: mockOnPress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<SelectBox {...defaultProps} />);
      expect(getByTestId('test-select-box')).toBeTruthy();
    });

    it('should display the correct value', () => {
      const { getByText } = render(<SelectBox {...defaultProps} />);
      expect(getByText('Test Value')).toBeTruthy();
    });

    it('should render matching snapshot', () => {
      const { toJSON } = render(<SelectBox {...defaultProps} />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Primary State', () => {
    it('should render with primary state by default', () => {
      const { getByTestId } = render(<SelectBox {...defaultProps} />);
      expect(getByTestId('test-select-box')).toBeTruthy();
    });

    it('should render with primary state when isPrimary is true', () => {
      const { getByTestId } = render(
        <SelectBox {...defaultProps} isPrimary={true} />,
      );
      expect(getByTestId('test-select-box')).toBeTruthy();
    });
  });

  describe('Secondary State', () => {
    it('should render with secondary state when isPrimary is false', () => {
      const { getByTestId } = render(
        <SelectBox {...defaultProps} isPrimary={false} />,
      );
      expect(getByTestId('test-select-box')).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('should render disabled state', () => {
      const { getByTestId } = render(
        <SelectBox {...defaultProps} disabled={true} />,
      );
      expect(getByTestId('test-select-box')).toBeTruthy();
    });

    it('should not call onPress when disabled', () => {
      const { getByTestId } = render(
        <SelectBox {...defaultProps} disabled={true} />,
      );
      const selectBox = getByTestId('test-select-box');
      fireEvent.press(selectBox);
      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when pressed', () => {
      const { getByTestId } = render(<SelectBox {...defaultProps} />);
      const selectBox = getByTestId('test-select-box');
      fireEvent.press(selectBox);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should call onPress multiple times', () => {
      const { getByTestId } = render(<SelectBox {...defaultProps} />);
      const selectBox = getByTestId('test-select-box');
      fireEvent.press(selectBox);
      fireEvent.press(selectBox);
      fireEvent.press(selectBox);
      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Props', () => {
    it('should render with different value', () => {
      const { getByText } = render(
        <SelectBox {...defaultProps} value="Different Value" />,
      );
      expect(getByText('Different Value')).toBeTruthy();
    });

    it('should render with custom className', () => {
      const { getByTestId } = render(
        <SelectBox {...defaultProps} className="custom-class" />,
      );
      expect(getByTestId('test-select-box')).toBeTruthy();
    });
  });
});
