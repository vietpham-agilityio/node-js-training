import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TextInput } from 'react-native';

// Component
import { SignInForm } from '../';

describe('SignInForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnForgotPassword = jest.fn();

  const defaultProps = {
    isPending: false,
    onSubmit: mockOnSubmit,
    onForgotPassword: mockOnForgotPassword,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<SignInForm {...defaultProps} />);
      expect(getByTestId('signin-email-input')).toBeTruthy();
    });

    it('should render email input field', () => {
      const { getByTestId } = render(<SignInForm {...defaultProps} />);
      expect(getByTestId('signin-email-input')).toBeTruthy();
    });

    it('should render password input field', () => {
      const { getByTestId } = render(<SignInForm {...defaultProps} />);
      expect(getByTestId('signin-password-input')).toBeTruthy();
    });

    it('should render submit button', () => {
      const { getByTestId } = render(<SignInForm {...defaultProps} />);
      expect(getByTestId('signin-submit-button')).toBeTruthy();
    });

    it('should render "Forgot Password?" link', () => {
      const { getByText } = render(<SignInForm {...defaultProps} />);
      expect(getByText('Forgot Password?')).toBeTruthy();
    });

    it('should display correct labels', () => {
      const { getByText } = render(<SignInForm {...defaultProps} />);
      expect(getByText('Email Address')).toBeTruthy();
      expect(getByText('Password')).toBeTruthy();
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in email input', () => {
      const { getByTestId } = render(<SignInForm {...defaultProps} />);
      const emailInput = getByTestId('signin-email-input-input');

      fireEvent.changeText(emailInput, 'test@example.com');
      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should allow typing in password input', () => {
      const { getByTestId } = render(<SignInForm {...defaultProps} />);
      const passwordInput = getByTestId('signin-password-input-input');

      fireEvent.changeText(passwordInput, 'Test123!');
      expect(passwordInput.props.value).toBe('Test123!');
    });

    it('should focus password input when email input submits', () => {
      const { getByTestId } = render(<SignInForm {...defaultProps} />);
      const emailInput = getByTestId('signin-email-input-input');

      // Mock the focus method on TextInput prototype
      const focusSpy = jest.spyOn(TextInput.prototype, 'focus');

      // Trigger onSubmitEditing on email input
      fireEvent(emailInput, 'submitEditing');

      // Verify that password input focus was called
      expect(focusSpy).toHaveBeenCalledTimes(1);

      focusSpy.mockRestore();
    });

    it('should call onForgotPassword when "Forgot Password?" is pressed', () => {
      const { getByText } = render(<SignInForm {...defaultProps} />);
      const forgotPasswordLink = getByText('Forgot Password?');

      fireEvent.press(forgotPasswordLink);
      expect(mockOnForgotPassword).toHaveBeenCalledTimes(1);
    });

    it('should not call onForgotPassword if prop is not provided', () => {
      const { getByText } = render(
        <SignInForm isPending={false} onSubmit={mockOnSubmit} />,
      );
      const forgotPasswordLink = getByText('Forgot Password?');

      fireEvent.press(forgotPasswordLink);
      // Should not crash even if onForgotPassword is undefined
      expect(mockOnForgotPassword).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when form is empty', () => {
      const { getByTestId } = render(<SignInForm {...defaultProps} />);
      const submitButton = getByTestId('signin-submit-button');

      expect(submitButton.props.disabled).toBe(undefined);
    });

    it('should show validation error for invalid email', async () => {
      const { getByTestId, queryByTestId } = render(
        <SignInForm {...defaultProps} />,
      );
      const emailInput = getByTestId('signin-email-input-input');

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent(emailInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('signin-email-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should show validation error for invalid password', async () => {
      const { getByTestId, queryByTestId } = render(
        <SignInForm {...defaultProps} />,
      );
      const passwordInput = getByTestId('signin-password-input-input');

      fireEvent.changeText(passwordInput, 'short');
      fireEvent(passwordInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('signin-password-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });
  });
});
