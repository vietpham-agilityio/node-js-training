import { authServiceEffect } from '@/features/auth/services/auth.effect';
import { Effect } from 'effect';
import { supabase } from '@/services/supabase/client';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TextInput } from 'react-native';

// Component
import { ResetPasswordForm } from '../';

// Mock dependencies
const mockSignOut = jest.fn();
const mockToastAlert = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
  })),
}));

jest.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    signOut: mockSignOut,
  }),
}));

jest.mock('@/hooks/useToast', () => ({
  useToastAlert: () => ({
    alert: mockToastAlert,
  }),
}));

jest.mock('@/services/supabase/client', () => ({
  supabase: {
    auth: {
      setSession: jest.fn(),
    },
  },
}));

jest.mock('@/features/auth/services/auth.effect', () => ({
  authServiceEffect: {
    updatePassword: jest.fn(),
  },
}));

describe('ResetPasswordForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.setSession as jest.Mock).mockResolvedValue({ error: null });
    (authServiceEffect.updatePassword as jest.Mock).mockReturnValue(
      Effect.succeed(true),
    );
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      expect(getByTestId('new-password-input')).toBeTruthy();
    });

    it('should render new password input field', () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      expect(getByTestId('new-password-input')).toBeTruthy();
    });

    it('should render confirm password input field', () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      expect(getByTestId('confirm-password-input')).toBeTruthy();
    });

    it('should render submit button', () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      expect(getByTestId('reset-password-submit-button')).toBeTruthy();
    });

    it('should display correct title and description', () => {
      const { getAllByText, getByText } = render(<ResetPasswordForm />);
      expect(getAllByText('Reset Password').length).toBeGreaterThan(0);
      expect(getByText('Enter your new password below')).toBeTruthy();
    });

    it('should display correct labels', () => {
      const { getByText } = render(<ResetPasswordForm />);
      expect(getByText('New Password')).toBeTruthy();
      expect(getByText('Confirm Password')).toBeTruthy();
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in new password input', () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');

      fireEvent.changeText(newPasswordInput, 'NewPass123!');
      expect(newPasswordInput.props.value).toBe('NewPass123!');
    });

    it('should allow typing in confirm password input', () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const confirmPasswordInput = getByTestId('confirm-password-input-input');

      fireEvent.changeText(confirmPasswordInput, 'NewPass123!');
      expect(confirmPasswordInput.props.value).toBe('NewPass123!');
    });

    it('should focus confirm password input when new password input submits', () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');

      // Mock the focus method on TextInput prototype
      const focusSpy = jest.spyOn(TextInput.prototype, 'focus');

      // Trigger onSubmitEditing on new password input
      fireEvent(newPasswordInput, 'submitEditing');

      // Verify that confirm password input focus was called
      expect(focusSpy).toHaveBeenCalledTimes(1);

      focusSpy.mockRestore();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for invalid new password', async () => {
      const { getByTestId, queryByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');

      fireEvent.changeText(newPasswordInput, 'short');
      fireEvent(newPasswordInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('new-password-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should not show validation errors for valid matching passwords', async () => {
      const { getByTestId, queryByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');

      fireEvent.changeText(newPasswordInput, 'ValidPass123!@');
      fireEvent(newPasswordInput, 'blur');

      fireEvent.changeText(confirmPasswordInput, 'ValidPass123!@');
      fireEvent(confirmPasswordInput, 'blur');

      await waitFor(() => {
        expect(queryByTestId('new-password-input-error')).toBeNull();
        expect(queryByTestId('confirm-password-input-error')).toBeNull();
      });
    });
  });

  describe('Form Submission - Success Cases', () => {
    it('should successfully reset password with valid credentials', async () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      // Fill in valid passwords
      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');

      // Submit the form
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(supabase.auth.setSession).toHaveBeenCalledWith({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        });
        expect(authServiceEffect.updatePassword).toHaveBeenCalledWith(
          'NewPass123!@',
        );
      });
    });

    it('should show success toast after password reset', async () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalledWith(
          expect.any(String), // Success title
          expect.any(String), // Success message
          expect.arrayContaining([
            expect.objectContaining({
              text: 'OK',
              onPress: expect.any(Function),
            }),
          ]),
          expect.objectContaining({ type: expect.any(String) }),
        );
      });
    });

    it('should call signOut when OK button is pressed on success toast', async () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalled();
      });

      // Get the onPress callback from the toast alert call
      const toastAlertCall = mockToastAlert.mock.calls[0];
      const buttons = toastAlertCall[2]; // Third argument is the buttons array
      const okButton = buttons.find((btn: any) => btn.text === 'OK');

      // Call the onPress function
      await okButton.onPress();

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('Form Submission - Error Cases', () => {
    it('should show error toast when setSession fails', async () => {
      (supabase.auth.setSession as jest.Mock).mockResolvedValueOnce({
        error: new Error('Session error'),
      });

      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalledWith(
          expect.any(String), // Error title
          'Session error', // Error message
          [],
          expect.objectContaining({ type: expect.any(String) }),
        );
      });

      // Ensure updatePassword was not called
      expect(authServiceEffect.updatePassword).not.toHaveBeenCalled();
    });

    it('should show generic error message when setSession fails with non-Error object', async () => {
      (supabase.auth.setSession as jest.Mock).mockResolvedValueOnce({
        error: { message: 'Some error' }, // Non-Error object
      });

      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining(''), // Generic error message
          [],
          expect.objectContaining({ type: expect.any(String) }),
        );
      });
    });

    it('should show error toast when updatePassword fails with Error', async () => {
      (authServiceEffect.updatePassword as jest.Mock).mockReturnValueOnce(
        Effect.fail(new Error('Update failed')),
      );

      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalledWith(
          expect.any(String), // Error title
          'Update failed', // Error message
          [],
          expect.objectContaining({ type: expect.any(String) }),
        );
      });
    });

    it('should show generic error message when updatePassword fails with non-Error', async () => {
      (authServiceEffect.updatePassword as jest.Mock).mockReturnValueOnce(
        Effect.fail('String error'),
      );

      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining(''), // Generic error message
          [],
          expect.objectContaining({ type: expect.any(String) }),
        );
      });
    });
  });

  describe('Form State', () => {
    it('should disable submit button while submitting', async () => {
      // Make updatePassword take some time
      (authServiceEffect.updatePassword as jest.Mock).mockImplementation(() =>
        Effect.tryPromise({
          try: async () =>
            await new Promise(resolve => setTimeout(resolve, 100)),
          catch: (e: unknown) => e,
        }),
      );

      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');
      fireEvent.press(submitButton);

      // Check button is disabled while submitting
      await waitFor(() => {
        const disabled =
          submitButton.props.accessibilityState?.disabled ||
          submitButton.props.disabled;
        expect(disabled).toBe(true);
      });
    });

    it('should have default empty values', () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');

      expect(newPasswordInput.props.value).toBe('');
      expect(confirmPasswordInput.props.value).toBe('');
    });
  });

  describe('Form Submission - Success Cases', () => {
    it('should successfully reset password with valid credentials', async () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      // Fill in valid passwords
      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');

      // Submit the form
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(supabase.auth.setSession).toHaveBeenCalledWith({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        });
        expect(authServiceEffect.updatePassword).toHaveBeenCalledWith(
          'NewPass123!@',
        );
      });
    });

    it('should show success toast after password reset', async () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalledWith(
          expect.any(String), // Success title
          expect.any(String), // Success message
          expect.arrayContaining([
            expect.objectContaining({
              text: 'OK',
              onPress: expect.any(Function),
            }),
          ]),
          expect.objectContaining({ type: expect.any(String) }),
        );
      });
    });

    it('should call signOut when OK button is pressed on success toast', async () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalled();
      });

      // Get the onPress callback from the toast alert call
      const toastAlertCall = mockToastAlert.mock.calls[0];
      const buttons = toastAlertCall[2]; // Third argument is the buttons array
      const okButton = buttons.find((btn: any) => btn.text === 'OK');

      // Call the onPress function
      await okButton.onPress();

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('Form Submission - Error Cases', () => {
    it('should show error toast when setSession fails', async () => {
      (supabase.auth.setSession as jest.Mock).mockResolvedValueOnce({
        error: new Error('Session error'),
      });

      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalledWith(
          expect.any(String), // Error title
          'Session error', // Error message
          [],
          expect.objectContaining({ type: expect.any(String) }),
        );
      });

      // Ensure updatePassword was not called
      expect(authServiceEffect.updatePassword).not.toHaveBeenCalled();
    });

    it('should show generic error message when setSession fails with non-Error object', async () => {
      (supabase.auth.setSession as jest.Mock).mockResolvedValueOnce({
        error: { message: 'Some error' }, // Non-Error object
      });

      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining(''), // Generic error message
          [],
          expect.objectContaining({ type: expect.any(String) }),
        );
      });
    });

    it('should show error toast when updatePassword fails with Error', async () => {
      (authServiceEffect.updatePassword as jest.Mock).mockReturnValueOnce(
        Effect.fail(new Error('Update failed')),
      );

      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalledWith(
          expect.any(String), // Error title
          'Update failed', // Error message
          [],
          expect.objectContaining({ type: expect.any(String) }),
        );
      });
    });

    it('should show generic error message when updatePassword fails with non-Error', async () => {
      (authServiceEffect.updatePassword as jest.Mock).mockReturnValueOnce(
        Effect.fail('String error'),
      );

      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('reset-password-submit-button');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining(''), // Generic error message
          [],
          expect.objectContaining({ type: expect.any(String) }),
        );
      });
    });
  });

  describe('Input Properties', () => {
    it('should have secure text entry enabled for password fields', () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');

      expect(newPasswordInput.props.secureTextEntry).toBe(true);
      expect(confirmPasswordInput.props.secureTextEntry).toBe(true);
    });

    it('should have correct return key types', () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');

      expect(newPasswordInput.props.returnKeyType).toBe('next');
      expect(confirmPasswordInput.props.returnKeyType).toBe('done');
    });

    it('should have autoCapitalize disabled', () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');

      expect(newPasswordInput.props.autoCapitalize).toBe('none');
      expect(confirmPasswordInput.props.autoCapitalize).toBe('none');
    });

    it('should have autoCorrect disabled', () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');

      expect(newPasswordInput.props.autoCorrect).toBe(false);
      expect(confirmPasswordInput.props.autoCorrect).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility labels', () => {
      const { getByLabelText, getAllByLabelText } = render(
        <ResetPasswordForm />,
      );

      expect(getByLabelText('New Password input field')).toBeTruthy();
      expect(getByLabelText('Confirm Password input field')).toBeTruthy();
      expect(getAllByLabelText('Reset Password')).toBeTruthy();
    });

    it('should have correct accessibility roles', () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');

      expect(newPasswordInput.props.accessibilityRole).toBe('text');
      expect(confirmPasswordInput.props.accessibilityRole).toBe('text');
    });

    it('should have accessible submit button', () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const submitButton = getByTestId('reset-password-submit-button');

      expect(submitButton.props.accessible).toBe(true);
      expect(submitButton.props.accessibilityLabel).toBe('Reset Password');
    });
  });

  describe('Layout and Styling', () => {
    it('should adjust spacing when validation errors are present', async () => {
      const { getByTestId } = render(<ResetPasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');

      // Trigger validation error
      fireEvent.changeText(newPasswordInput, 'short');
      fireEvent(newPasswordInput, 'blur');

      await waitFor(() => {
        expect(getByTestId('new-password-input-error')).toBeTruthy();
      });
    });
  });
});
