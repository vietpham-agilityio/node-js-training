import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

// Component
import { type InputReturnType } from '@/components/Input';
import { EmailInput } from '..';

// Wrapper component to provide react-hook-form context
interface FormValues {
  email: string;
}

interface WrapperProps {
  defaultValue?: string;
  testID?: string;
  label?: string;
  returnKeyType?: InputReturnType;
  onSubmitEditing?: () => void;
}

const EmailInputWrapper = ({
  defaultValue = '',
  testID = 'test-email',
  label,
  returnKeyType,
  onSubmitEditing,
}: WrapperProps) => {
  const { control } = useForm<FormValues>({
    defaultValues: { email: defaultValue },
  });

  return (
    <View>
      <EmailInput
        control={control}
        name="email"
        testID={testID}
        label={label}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
};

describe('EmailInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<EmailInputWrapper />);
      expect(getByTestId('test-email')).toBeTruthy();
    });

    it('should render with default label "Email Address"', () => {
      const { getByText } = render(<EmailInputWrapper />);
      expect(getByText('Email Address')).toBeTruthy();
    });

    it('should render with custom label', () => {
      const { getByText } = render(<EmailInputWrapper label="Work Email" />);
      expect(getByText('Work Email')).toBeTruthy();
    });

    it('should render the input field', () => {
      const { getByTestId } = render(<EmailInputWrapper />);
      expect(getByTestId('test-email-input')).toBeTruthy();
    });

    it('should render with initial value', () => {
      const { getByDisplayValue } = render(
        <EmailInputWrapper defaultValue="test@example.com" />,
      );
      expect(getByDisplayValue('test@example.com')).toBeTruthy();
    });
  });

  describe('Input Behavior', () => {
    it('should have email keyboard type', () => {
      const { getByTestId } = render(<EmailInputWrapper />);
      const input = getByTestId('test-email-input');
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('should have autoCapitalize set to none', () => {
      const { getByTestId } = render(<EmailInputWrapper />);
      const input = getByTestId('test-email-input');
      expect(input.props.autoCapitalize).toBe('none');
    });

    it('should have autoCorrect disabled', () => {
      const { getByTestId } = render(<EmailInputWrapper />);
      const input = getByTestId('test-email-input');
      expect(input.props.autoCorrect).toBe(false);
    });

    it('should have default returnKeyType as next', () => {
      const { getByTestId } = render(<EmailInputWrapper />);
      const input = getByTestId('test-email-input');
      expect(input.props.returnKeyType).toBe('next');
    });

    it('should accept custom returnKeyType', () => {
      const { getByTestId } = render(
        <EmailInputWrapper returnKeyType="done" />,
      );
      const input = getByTestId('test-email-input');
      expect(input.props.returnKeyType).toBe('done');
    });

    it('should handle text changes', async () => {
      const { getByTestId } = render(<EmailInputWrapper />);
      const input = getByTestId('test-email-input');

      fireEvent.changeText(input, 'new@email.com');

      await waitFor(() => {
        expect(input.props.value).toBe('new@email.com');
      });
    });

    it('should call onSubmitEditing when provided', () => {
      const onSubmitEditing = jest.fn();
      const { getByTestId } = render(
        <EmailInputWrapper onSubmitEditing={onSubmitEditing} />,
      );
      const input = getByTestId('test-email-input');

      fireEvent(input, 'submitEditing');

      expect(onSubmitEditing).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label', () => {
      const { getByLabelText } = render(<EmailInputWrapper />);
      expect(getByLabelText('Email Address input field')).toBeTruthy();
    });

    it('should have correct accessibility hint', () => {
      const { getByTestId } = render(<EmailInputWrapper />);
      const input = getByTestId('test-email-input');
      expect(input.props.accessibilityHint).toBe('Enter your email address');
    });

    it('should have correct accessibility role', () => {
      const { getByTestId } = render(<EmailInputWrapper />);
      const input = getByTestId('test-email-input');
      expect(input.props.accessibilityRole).toBe('text');
    });

    it('should update accessibility label with custom label', () => {
      const { getByLabelText } = render(
        <EmailInputWrapper label="Work Email" />,
      );
      expect(getByLabelText('Work Email input field')).toBeTruthy();
    });
  });

  describe('Focus and Blur', () => {
    it('should handle focus event', () => {
      const { getByTestId } = render(<EmailInputWrapper />);
      const input = getByTestId('test-email-input');
      expect(() => fireEvent(input, 'focus')).not.toThrow();
    });

    it('should handle blur event', () => {
      const { getByTestId } = render(<EmailInputWrapper />);
      const input = getByTestId('test-email-input');
      expect(() => fireEvent(input, 'blur')).not.toThrow();
    });
  });
});
