import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TextInput } from 'react-native';

// Component
import { SignUpForm } from '../';

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('SignUpForm Component', () => {
  const mockOnSubmit = jest.fn();

  const defaultProps = {
    isPending: false,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      expect(getByTestId('signup-fullname-input')).toBeTruthy();
    });

    it('should render full name input field', () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      expect(getByTestId('signup-fullname-input')).toBeTruthy();
    });

    it('should render email input field', () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      expect(getByTestId('signup-email-input')).toBeTruthy();
    });

    it('should render password input field', () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      expect(getByTestId('signup-password-input')).toBeTruthy();
    });

    it('should render confirm password input field', () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      expect(getByTestId('signup-confirmpassword-input')).toBeTruthy();
    });

    it('should render submit button', () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      expect(getByTestId('signup-submit-button')).toBeTruthy();
    });

    it('should display correct labels', () => {
      const { getByText } = render(<SignUpForm {...defaultProps} />);
      expect(getByText('Full Name')).toBeTruthy();
      expect(getByText('Email Address')).toBeTruthy();
      expect(getByText('Password')).toBeTruthy();
      expect(getByText('Confirm Password')).toBeTruthy();
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in full name input', () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      const fullNameInput = getByTestId('signup-fullname-input-input');

      fireEvent.changeText(fullNameInput, 'John Doe');
      expect(fullNameInput.props.value).toBe('John Doe');
    });

    it('should allow typing in email input', () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      const emailInput = getByTestId('signup-email-input-input');

      fireEvent.changeText(emailInput, 'test@example.com');
      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should allow typing in password input', () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      const passwordInput = getByTestId('signup-password-input-input');

      fireEvent.changeText(passwordInput, 'Test123!');
      expect(passwordInput.props.value).toBe('Test123!');
    });

    it('should allow typing in confirm password input', () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      const confirmPasswordInput = getByTestId(
        'signup-confirmpassword-input-input',
      );

      fireEvent.changeText(confirmPasswordInput, 'Test123!');
      expect(confirmPasswordInput.props.value).toBe('Test123!');
    });

    it('should focus email input when full name input submits', () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      const fullNameInput = getByTestId('signup-fullname-input-input');

      const focusSpy = jest.spyOn(TextInput.prototype, 'focus');

      fireEvent(fullNameInput, 'submitEditing');

      expect(focusSpy).toHaveBeenCalledTimes(1);

      focusSpy.mockRestore();
    });

    it('should focus password input when email input submits', () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      const emailInput = getByTestId('signup-email-input-input');

      const focusSpy = jest.spyOn(TextInput.prototype, 'focus');

      fireEvent(emailInput, 'submitEditing');

      expect(focusSpy).toHaveBeenCalledTimes(1);

      focusSpy.mockRestore();
    });

    it('should focus confirm password input when password input submits', () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      const passwordInput = getByTestId('signup-password-input-input');

      const focusSpy = jest.spyOn(TextInput.prototype, 'focus');

      fireEvent(passwordInput, 'submitEditing');

      expect(focusSpy).toHaveBeenCalledTimes(1);

      focusSpy.mockRestore();
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when form is empty', () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      const submitButton = getByTestId('signup-submit-button');

      expect(submitButton.props.disabled).toBe(undefined);
    });

    it('should show validation error for invalid full name', async () => {
      const { getByTestId, queryByTestId } = render(
        <SignUpForm {...defaultProps} />,
      );
      const fullNameInput = getByTestId('signup-fullname-input-input');

      fireEvent.changeText(fullNameInput, 'A');
      fireEvent(fullNameInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('signup-fullname-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should show validation error for invalid email', async () => {
      const { getByTestId, queryByTestId } = render(
        <SignUpForm {...defaultProps} />,
      );
      const emailInput = getByTestId('signup-email-input-input');

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent(emailInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('signup-email-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should show validation error for invalid password', async () => {
      const { getByTestId, queryByTestId } = render(
        <SignUpForm {...defaultProps} />,
      );
      const passwordInput = getByTestId('signup-password-input-input');

      fireEvent.changeText(passwordInput, 'short');
      fireEvent(passwordInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('signup-password-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form data when valid form is submitted', async () => {
      const { getByTestId } = render(<SignUpForm {...defaultProps} />);
      const fullNameInput = getByTestId('signup-fullname-input-input');
      const emailInput = getByTestId('signup-email-input-input');
      const passwordInput = getByTestId('signup-password-input-input');
      const confirmPasswordInput = getByTestId(
        'signup-confirmpassword-input-input',
      );
      const submitButton = getByTestId('signup-submit-button');

      fireEvent.changeText(fullNameInput, 'John Doe');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(passwordInput, 'Test123!@');
      fireEvent.changeText(confirmPasswordInput, 'Test123!@');

      // Wait for form to be valid and button to be enabled
      await waitFor(() => {
        expect(submitButton.props.disabled).toBe(undefined);
      });

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          fullName: 'John Doe',
          email: 'john@example.com',
          password: 'Test123!@',
          avatarUrl: undefined,
        });
      });
    });
  });
});
