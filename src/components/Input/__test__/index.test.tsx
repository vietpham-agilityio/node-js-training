import { fireEvent, render } from '@testing-library/react-native';
import { Animated } from 'react-native';

// Component
import { Input } from '../';

describe('Input Component', () => {
  const defaultProps = {
    label: 'Email Address',
    testID: 'test-input',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<Input {...defaultProps} />);
      expect(getByTestId('test-input')).toBeTruthy();
    });

    it('should render the label', () => {
      const { getByText } = render(<Input {...defaultProps} />);
      expect(getByText('Email Address')).toBeTruthy();
    });

    it('should render the input field', () => {
      const { getByTestId } = render(<Input {...defaultProps} />);
      expect(getByTestId('test-input-input')).toBeTruthy();
    });

    it('should render with initial value', () => {
      const { getByDisplayValue } = render(
        <Input {...defaultProps} value="test@example.com" />,
      );
      expect(getByDisplayValue('test@example.com')).toBeTruthy();
    });

    it('should render with empty string value', () => {
      const { getByTestId } = render(<Input {...defaultProps} value="" />);
      const input = getByTestId('test-input-input');
      expect(input.props.value).toBe('');
    });

    it('should render with default empty value when value prop is not provided', () => {
      const { getByTestId } = render(<Input {...defaultProps} />);
      const input = getByTestId('test-input-input');
      expect(input.props.value).toBe('');
    });
  });

  describe('Label Behavior', () => {
    it('should always render the label', () => {
      const { getByText } = render(<Input {...defaultProps} />);
      expect(getByText('Email Address')).toBeTruthy();
    });

    it('should render label with custom text', () => {
      const { getByText } = render(
        <Input {...defaultProps} label="Password" />,
      );
      expect(getByText('Password')).toBeTruthy();
    });
  });

  describe('Focus and Blur', () => {
    it('should handle focus event', () => {
      const onFocus = jest.fn();
      const { getByTestId } = render(
        <Input {...defaultProps} onFocus={onFocus} />,
      );
      const input = getByTestId('test-input-input');
      fireEvent(input, 'focus');
      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle blur event', () => {
      const onBlur = jest.fn();
      const { getByTestId } = render(
        <Input {...defaultProps} onBlur={onBlur} />,
      );
      const input = getByTestId('test-input-input');
      fireEvent(input, 'blur');
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle focus and blur sequence', () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      const { getByTestId } = render(
        <Input {...defaultProps} onFocus={onFocus} onBlur={onBlur} />,
      );
      const input = getByTestId('test-input-input');
      fireEvent(input, 'focus');
      fireEvent(input, 'blur');
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('should not trigger animation when blurring with non-empty value', () => {
      const onBlur = jest.fn();
      const timingSpy = jest.spyOn(Animated, 'timing');
      const { getByTestId } = render(
        <Input {...defaultProps} value="test@example.com" onBlur={onBlur} />,
      );
      const input = getByTestId('test-input-input');

      // Focus first to set up the state
      fireEvent(input, 'focus');
      timingSpy.mockClear();

      // Blur with non-empty value should NOT trigger animation to 0
      fireEvent(input, 'blur');

      // Animated.timing should not be called for blur when value is not empty
      expect(timingSpy).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          toValue: 0,
        }),
      );

      expect(onBlur).toHaveBeenCalledTimes(1);

      timingSpy.mockRestore();
    });
  });

  describe('Text Input', () => {
    it('should handle text changes', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <Input {...defaultProps} onChangeText={onChangeText} />,
      );
      const input = getByTestId('test-input-input');
      fireEvent.changeText(input, 'test@example.com');
      expect(onChangeText).toHaveBeenCalledWith('test@example.com');
    });

    it('should call onChangeText with correct value', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <Input {...defaultProps} onChangeText={onChangeText} />,
      );
      const input = getByTestId('test-input-input');
      fireEvent.changeText(input, 'new@email.com');
      expect(onChangeText).toHaveBeenCalledWith('new@email.com');
      expect(onChangeText).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple text changes', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <Input {...defaultProps} onChangeText={onChangeText} />,
      );
      const input = getByTestId('test-input-input');
      fireEvent.changeText(input, 'a');
      fireEvent.changeText(input, 'ab');
      fireEvent.changeText(input, 'abc');
      expect(onChangeText).toHaveBeenCalledTimes(3);
      expect(onChangeText).toHaveBeenLastCalledWith('abc');
    });

    it('should handle empty string text change', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <Input {...defaultProps} onChangeText={onChangeText} value="initial" />,
      );
      const input = getByTestId('test-input-input');
      fireEvent.changeText(input, '');
      expect(onChangeText).toHaveBeenCalledWith('');
    });

    it('should maintain controlled value', () => {
      const { getByTestId, rerender } = render(
        <Input {...defaultProps} value="initial" />,
      );
      const input = getByTestId('test-input-input');
      expect(input.props.value).toBe('initial');

      rerender(<Input {...defaultProps} value="updated" />);
      expect(input.props.value).toBe('updated');
    });

    it('should handle onChangeText without callback', () => {
      const { getByTestId } = render(<Input {...defaultProps} />);
      const input = getByTestId('test-input-input');
      expect(() => fireEvent.changeText(input, 'test')).not.toThrow();
    });
  });

  describe('Error State', () => {
    it('should display error message', () => {
      const { getByTestId } = render(
        <Input {...defaultProps} error="Invalid email address" />,
      );
      expect(getByTestId('test-input-error')).toBeTruthy();
    });

    it('should show correct error text', () => {
      const { getByText } = render(
        <Input {...defaultProps} error="Invalid email address" />,
      );
      expect(getByText('Invalid email address')).toBeTruthy();
    });

    it('should not display error when no error prop', () => {
      const { queryByTestId } = render(<Input {...defaultProps} />);
      expect(queryByTestId('test-input-error')).toBeNull();
    });

    it('should not display error when error is empty string', () => {
      const { queryByTestId } = render(<Input {...defaultProps} error="" />);
      expect(queryByTestId('test-input-error')).toBeNull();
    });
  });

  describe('Password Input', () => {
    it('should render password toggle when secureTextEntry is true', () => {
      const { getByTestId } = render(
        <Input {...defaultProps} secureTextEntry />,
      );
      expect(getByTestId('test-input-password-toggle')).toBeTruthy();
    });

    it('should not render password toggle when secureTextEntry is false', () => {
      const { queryByTestId } = render(<Input {...defaultProps} />);
      expect(queryByTestId('test-input-password-toggle')).toBeNull();
    });

    it('should not render password toggle when secureTextEntry is undefined', () => {
      const { queryByTestId } = render(
        <Input {...defaultProps} secureTextEntry={undefined} />,
      );
      expect(queryByTestId('test-input-password-toggle')).toBeNull();
    });

    it('should toggle password visibility', () => {
      const { getByTestId } = render(
        <Input {...defaultProps} secureTextEntry />,
      );
      const input = getByTestId('test-input-input');
      const toggle = getByTestId('test-input-password-toggle');

      expect(input.props.secureTextEntry).toBe(true);

      fireEvent.press(toggle);
      expect(input.props.secureTextEntry).toBe(false);

      fireEvent.press(toggle);
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('should start with password hidden', () => {
      const { getByTestId } = render(
        <Input {...defaultProps} secureTextEntry />,
      );
      const input = getByTestId('test-input-input');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('should maintain password visibility state across toggles', () => {
      const { getByTestId } = render(
        <Input {...defaultProps} secureTextEntry />,
      );
      const input = getByTestId('test-input-input');
      const toggle = getByTestId('test-input-password-toggle');

      // Toggle multiple times
      fireEvent.press(toggle);
      expect(input.props.secureTextEntry).toBe(false);

      fireEvent.press(toggle);
      expect(input.props.secureTextEntry).toBe(true);

      fireEvent.press(toggle);
      expect(input.props.secureTextEntry).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have correct testID for input', () => {
      const { getByTestId } = render(
        <Input {...defaultProps} testID="custom-input" />,
      );
      expect(getByTestId('custom-input-input')).toBeTruthy();
    });
  });
});
