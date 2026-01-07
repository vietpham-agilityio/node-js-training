import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ForgotPasswordScreen from '../index';

// Mock dependencies
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockMutate = jest.fn();
const mockToastWithAction = jest.fn();
const mockToastError = jest.fn();

let mockIsPending = false;

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
  }),
}));

jest.mock('@/hooks/useSession', () => ({
  useResetPassword: () => ({
    mutate: mockMutate,
    get isPending() {
      return mockIsPending;
    },
  }),
}));

jest.mock('@/hooks/useToast', () => ({
  useToastAlert: () => ({
    withAction: mockToastWithAction,
    error: mockToastError,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPending = false;
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = render(<ForgotPasswordScreen />);
      expect(getByText('Forgot Password?')).toBeTruthy();
    });

    it('should render title', () => {
      const { getByText } = render(<ForgotPasswordScreen />);
      expect(getByText('Forgot Password?')).toBeTruthy();
    });

    it('should render description text', () => {
      const { getByText } = render(<ForgotPasswordScreen />);
      expect(
        getByText(
          "Enter your email address and we'll send you a link to reset your password.",
        ),
      ).toBeTruthy();
    });

    it('should render email input field', () => {
      const { getByLabelText } = render(<ForgotPasswordScreen />);
      expect(getByLabelText('Email Address input field')).toBeTruthy();
    });

    it('should render submit button', () => {
      const { getByText } = render(<ForgotPasswordScreen />);
      expect(getByText('Send Reset Link')).toBeTruthy();
    });

    it('should render back to login button', () => {
      const { getByText } = render(<ForgotPasswordScreen />);
      expect(getByText('Back to Login')).toBeTruthy();
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in email input', () => {
      const { getByLabelText } = render(<ForgotPasswordScreen />);
      const emailInput = getByLabelText('Email Address input field');

      fireEvent.changeText(emailInput, 'test@example.com');
      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should show "Sending..." when isPending is true', () => {
      mockIsPending = true;
      const { getByText } = render(<ForgotPasswordScreen />);
      expect(getByText('Sending...')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should not show alert when email is provided', () => {
      const { getByLabelText } = render(<ForgotPasswordScreen />);
      const emailInput = getByLabelText('Email Address input field');
      const submitButton = getByLabelText('Send password reset link');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(submitButton);

      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should call resetPassword mutation with email when form is submitted', async () => {
      const { getByLabelText } = render(<ForgotPasswordScreen />);
      const emailInput = getByLabelText('Email Address input field');
      const submitButton = getByLabelText('Send password reset link');

      fireEvent.changeText(emailInput, 'test@example.com');

      // Wait for form to be valid and button to be enabled
      await waitFor(() => {
        expect(submitButton.props.disabled).toBe(undefined);
      });

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          'test@example.com',
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          }),
        );
      });
    });

    it('should show success toast and navigate to login on success', async () => {
      const { getByLabelText } = render(<ForgotPasswordScreen />);
      const emailInput = getByLabelText('Email Address input field');
      const submitButton = getByLabelText('Send password reset link');

      fireEvent.changeText(emailInput, 'test@example.com');

      // Wait for form to be valid and button to be enabled
      await waitFor(() => {
        expect(submitButton.props.disabled).toBe(undefined);
      });

      fireEvent.press(submitButton);

      await waitFor(() => {
        // Get the onSuccess callback from the mutate call
        const mutateCall = mockMutate.mock.calls[0];
        const onSuccessCallback = mutateCall[1].onSuccess;

        // Execute the success callback
        onSuccessCallback();
      });

      expect(mockToastWithAction).toHaveBeenCalledWith(
        'Password reset link has been sent to your email.',
        {
          label: 'OK',
          onPress: expect.any(Function),
        },
        'success',
      );

      // Execute the OK button callback
      const toastCall = mockToastWithAction.mock.calls[0];
      toastCall[1].onPress();

      expect(mockReplace).toHaveBeenCalledWith('/(auth)/signin');
    });

    it('should show error toast on error', async () => {
      const { getByLabelText } = render(<ForgotPasswordScreen />);
      const emailInput = getByLabelText('Email Address input field');
      const submitButton = getByLabelText('Send password reset link');

      fireEvent.changeText(emailInput, 'test@example.com');

      // Wait for form to be valid and button to be enabled
      await waitFor(() => {
        expect(submitButton.props.disabled).toBe(undefined);
      });

      fireEvent.press(submitButton);

      await waitFor(() => {
        // Get the onError callback from the mutate call
        const mutateCall = mockMutate.mock.calls[0];
        const onErrorCallback = mutateCall[1].onError;

        // Execute the error callback
        onErrorCallback();
      });

      expect(mockToastError).toHaveBeenCalledWith('Failed to send reset link');
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility labels', () => {
      const { getByLabelText } = render(<ForgotPasswordScreen />);

      expect(getByLabelText('Email Address input field')).toBeTruthy();
      expect(getByLabelText('Send password reset link')).toBeTruthy();
      expect(getByLabelText('Back to login')).toBeTruthy();
    });

    it('should have correct accessibility hints', () => {
      const { getByLabelText } = render(<ForgotPasswordScreen />);

      const emailInput = getByLabelText('Email Address input field');
      expect(emailInput.props.accessibilityHint).toBe(
        'Enter your email address',
      );

      const submitButton = getByLabelText('Send password reset link');
      expect(submitButton.props.accessibilityHint).toBe(
        'Sends an email with password reset instructions',
      );

      const backButton = getByLabelText('Back to login');
      expect(backButton.props.accessibilityHint).toBe(
        'Navigate back to the Login screen',
      );
    });
  });
});
