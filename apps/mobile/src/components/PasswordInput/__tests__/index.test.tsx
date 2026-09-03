import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

// Component
import { PasswordInput } from '..';

// Type
import { type InputReturnType } from '@/components/Input';

// Wrapper component to provide react-hook-form context
interface FormValues {
  password: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface WrapperProps {
  name?: keyof FormValues;
  defaultValue?: string;
  testID?: string;
  label?: string;
  returnKeyType?: InputReturnType;
  containerClassName?: string;
  onSubmitEditing?: () => void;
}

const PasswordInputWrapper = ({
  name = 'password',
  defaultValue = '',
  testID = 'test-password',
  label,
  returnKeyType,
  containerClassName,
  onSubmitEditing,
}: WrapperProps) => {
  const { control } = useForm<FormValues>({
    defaultValues: {
      password: defaultValue,
      currentPassword: defaultValue,
      newPassword: defaultValue,
      confirmPassword: defaultValue,
    },
  });

  return (
    <View>
      <PasswordInput
        control={control}
        name={name}
        testID={testID}
        label={label}
        returnKeyType={returnKeyType}
        containerClassName={containerClassName}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
};

describe('PasswordInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<PasswordInputWrapper />);
      expect(getByTestId('test-password')).toBeTruthy();
    });

    it('should render the input field', () => {
      const { getByTestId } = render(<PasswordInputWrapper />);
      expect(getByTestId('test-password-input')).toBeTruthy();
    });

    it('should render password toggle button', () => {
      const { getByTestId } = render(<PasswordInputWrapper />);
      expect(getByTestId('test-password-password-toggle')).toBeTruthy();
    });

    it('should render with initial value', () => {
      const { getByTestId } = render(
        <PasswordInputWrapper defaultValue="secret123" />,
      );
      const input = getByTestId('test-password-input');
      expect(input.props.value).toBe('secret123');
    });
  });

  describe('Label Auto-Resolution', () => {
    it('should auto-resolve label for "password" field', () => {
      const { getByText } = render(<PasswordInputWrapper name="password" />);
      expect(getByText('Password')).toBeTruthy();
    });

    it('should auto-resolve label for "currentPassword" field', () => {
      const { getByText } = render(
        <PasswordInputWrapper name="currentPassword" />,
      );
      expect(getByText('Current Password')).toBeTruthy();
    });

    it('should auto-resolve label for "newPassword" field', () => {
      const { getByText } = render(<PasswordInputWrapper name="newPassword" />);
      expect(getByText('New Password')).toBeTruthy();
    });

    it('should auto-resolve label for "confirmPassword" field', () => {
      const { getByText } = render(
        <PasswordInputWrapper name="confirmPassword" />,
      );
      expect(getByText('Confirm Password')).toBeTruthy();
    });

    it('should use custom label when provided', () => {
      const { getByText } = render(
        <PasswordInputWrapper name="password" label="Secret Code" />,
      );
      expect(getByText('Secret Code')).toBeTruthy();
    });
  });

  describe('Input Behavior', () => {
    it('should have secureTextEntry enabled by default', () => {
      const { getByTestId } = render(<PasswordInputWrapper />);
      const input = getByTestId('test-password-input');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('should toggle password visibility when toggle is pressed', () => {
      const { getByTestId } = render(<PasswordInputWrapper />);
      const input = getByTestId('test-password-input');
      const toggle = getByTestId('test-password-password-toggle');

      expect(input.props.secureTextEntry).toBe(true);

      fireEvent.press(toggle);
      expect(input.props.secureTextEntry).toBe(false);

      fireEvent.press(toggle);
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('should have autoCapitalize set to none', () => {
      const { getByTestId } = render(<PasswordInputWrapper />);
      const input = getByTestId('test-password-input');
      expect(input.props.autoCapitalize).toBe('none');
    });

    it('should have autoCorrect disabled', () => {
      const { getByTestId } = render(<PasswordInputWrapper />);
      const input = getByTestId('test-password-input');
      expect(input.props.autoCorrect).toBe(false);
    });

    it('should have default returnKeyType as next', () => {
      const { getByTestId } = render(<PasswordInputWrapper />);
      const input = getByTestId('test-password-input');
      expect(input.props.returnKeyType).toBe('next');
    });

    it('should accept custom returnKeyType', () => {
      const { getByTestId } = render(
        <PasswordInputWrapper returnKeyType="done" />,
      );
      const input = getByTestId('test-password-input');
      expect(input.props.returnKeyType).toBe('done');
    });

    it('should handle text changes', async () => {
      const { getByTestId } = render(<PasswordInputWrapper />);
      const input = getByTestId('test-password-input');

      fireEvent.changeText(input, 'newpassword123');

      await waitFor(() => {
        expect(input.props.value).toBe('newpassword123');
      });
    });

    it('should call onSubmitEditing when provided', () => {
      const onSubmitEditing = jest.fn();
      const { getByTestId } = render(
        <PasswordInputWrapper onSubmitEditing={onSubmitEditing} />,
      );
      const input = getByTestId('test-password-input');

      fireEvent(input, 'submitEditing');

      expect(onSubmitEditing).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label for password field', () => {
      const { getByLabelText } = render(
        <PasswordInputWrapper name="password" />,
      );
      expect(getByLabelText('Password input field')).toBeTruthy();
    });

    it('should have correct accessibility label for currentPassword field', () => {
      const { getByLabelText } = render(
        <PasswordInputWrapper name="currentPassword" />,
      );
      expect(getByLabelText('Current Password input field')).toBeTruthy();
    });

    it('should have correct accessibility label for newPassword field', () => {
      const { getByLabelText } = render(
        <PasswordInputWrapper name="newPassword" />,
      );
      expect(getByLabelText('New Password input field')).toBeTruthy();
    });

    it('should have correct accessibility label for confirmPassword field', () => {
      const { getByLabelText } = render(
        <PasswordInputWrapper name="confirmPassword" />,
      );
      expect(getByLabelText('Confirm Password input field')).toBeTruthy();
    });

    it('should have correct accessibility hint', () => {
      const { getByTestId } = render(<PasswordInputWrapper name="password" />);
      const input = getByTestId('test-password-input');
      expect(input.props.accessibilityHint).toBe('Type your password');
    });

    it('should have correct accessibility role', () => {
      const { getByTestId } = render(<PasswordInputWrapper />);
      const input = getByTestId('test-password-input');
      expect(input.props.accessibilityRole).toBe('text');
    });

    it('should update accessibility label with custom label', () => {
      const { getByLabelText } = render(
        <PasswordInputWrapper label="Secret Code" />,
      );
      expect(getByLabelText('Secret Code input field')).toBeTruthy();
    });

    it('should have accessible password toggle button', () => {
      const { getByTestId } = render(<PasswordInputWrapper />);
      const toggle = getByTestId('test-password-password-toggle');
      expect(toggle.props.accessible).toBe(true);
      expect(toggle.props.accessibilityRole).toBe('button');
      expect(toggle.props.accessibilityLabel).toBe(
        'Toggle password visibility',
      );
    });
  });

  describe('Container Styling', () => {
    it('should apply containerClassName when provided', () => {
      const { getByTestId } = render(
        <PasswordInputWrapper containerClassName="mb-4" />,
      );
      expect(getByTestId('test-password')).toBeTruthy();
    });
  });

  describe('Focus and Blur', () => {
    it('should handle focus event', () => {
      const { getByTestId } = render(<PasswordInputWrapper />);
      const input = getByTestId('test-password-input');
      expect(() => fireEvent(input, 'focus')).not.toThrow();
    });

    it('should handle blur event', () => {
      const { getByTestId } = render(<PasswordInputWrapper />);
      const input = getByTestId('test-password-input');
      expect(() => fireEvent(input, 'blur')).not.toThrow();
    });
  });
});
