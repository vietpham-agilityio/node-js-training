import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TextInput } from 'react-native';

// Component
import { ChangePasswordForm } from '../';

// Constants
import { ERROR_MESSAGES, MESSAGES } from '@/constants';

// Mock dependencies
const mockBack = jest.fn();
const mockToastAlert = jest.fn();
const mockUpdatePassword = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock('@/hooks/useToast', () => ({
  useToastAlert: () => ({
    alert: mockToastAlert,
  }),
}));

jest.mock('@/hooks/useSession', () => ({
  useUpdatePassword: () => ({
    mutate: mockUpdatePassword,
    isPending: false,
  }),
}));

describe('ChangePasswordForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      expect(getByTestId('current-password-input')).toBeTruthy();
    });

    it('should render current password input field', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      expect(getByTestId('current-password-input')).toBeTruthy();
    });

    it('should render new password input field', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      expect(getByTestId('new-password-input')).toBeTruthy();
    });

    it('should render confirm password input field', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      expect(getByTestId('confirm-password-input')).toBeTruthy();
    });

    it('should render submit button', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      expect(getByTestId('change-password-submit-button')).toBeTruthy();
    });

    it('should display correct labels', () => {
      const { getByText } = render(<ChangePasswordForm />);
      expect(getByText('Current Password')).toBeTruthy();
      expect(getByText('Password')).toBeTruthy();
      expect(getByText('Confirm Password')).toBeTruthy();
    });

    it('should display submit button with correct text', () => {
      const { getByText } = render(<ChangePasswordForm />);
      expect(getByText('Change Password')).toBeTruthy();
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in current password input', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      const currentPasswordInput = getByTestId('current-password-input-input');

      fireEvent.changeText(currentPasswordInput, 'CurrentPass123!');
      expect(currentPasswordInput.props.value).toBe('CurrentPass123!');
    });

    it('should allow typing in new password input', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');

      fireEvent.changeText(newPasswordInput, 'NewPass123!');
      expect(newPasswordInput.props.value).toBe('NewPass123!');
    });

    it('should allow typing in confirm password input', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      const confirmPasswordInput = getByTestId('confirm-password-input-input');

      fireEvent.changeText(confirmPasswordInput, 'NewPass123!');
      expect(confirmPasswordInput.props.value).toBe('NewPass123!');
    });

    it('should focus new password input when current password input submits', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      const currentPasswordInput = getByTestId('current-password-input-input');

      const focusSpy = jest.spyOn(TextInput.prototype, 'focus');

      fireEvent(currentPasswordInput, 'submitEditing');

      expect(focusSpy).toHaveBeenCalledTimes(1);

      focusSpy.mockRestore();
    });

    it('should focus confirm password input when new password input submits', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');

      const focusSpy = jest.spyOn(TextInput.prototype, 'focus');

      fireEvent(newPasswordInput, 'submitEditing');

      expect(focusSpy).toHaveBeenCalledTimes(1);

      focusSpy.mockRestore();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error when current password is empty', async () => {
      const { getByTestId, queryByTestId } = render(<ChangePasswordForm />);
      const currentPasswordInput = getByTestId('current-password-input-input');

      fireEvent.changeText(currentPasswordInput, '');
      fireEvent(currentPasswordInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('current-password-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should show validation error for short new password', async () => {
      const { getByTestId, queryByTestId } = render(<ChangePasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');

      fireEvent.changeText(newPasswordInput, 'short');
      fireEvent(newPasswordInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('new-password-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should show validation error when new password lacks uppercase', async () => {
      const { getByTestId, queryByTestId } = render(<ChangePasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');

      fireEvent.changeText(newPasswordInput, 'lowercaseonly1!');
      fireEvent(newPasswordInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('new-password-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should show validation error when new password lacks lowercase', async () => {
      const { getByTestId, queryByTestId } = render(<ChangePasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');

      fireEvent.changeText(newPasswordInput, 'UPPERCASEONLY1!');
      fireEvent(newPasswordInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('new-password-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should show validation error when new password lacks special character', async () => {
      const { getByTestId, queryByTestId } = render(<ChangePasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');

      fireEvent.changeText(newPasswordInput, 'NoSpecialChar1');
      fireEvent(newPasswordInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('new-password-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should show validation error when passwords do not match', async () => {
      const { getByTestId, queryByTestId } = render(<ChangePasswordForm />);
      const currentPasswordInput = getByTestId('current-password-input-input');
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('change-password-submit-button');

      fireEvent.changeText(currentPasswordInput, 'CurrentPass123!');
      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'DifferentPass123!@');

      fireEvent.press(submitButton);

      await waitFor(() => {
        const errorMessage = queryByTestId('confirm-password-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should show validation error when confirm password is empty', async () => {
      const { getByTestId, queryByTestId } = render(<ChangePasswordForm />);
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent(newPasswordInput, 'blur');

      fireEvent.changeText(confirmPasswordInput, '');
      fireEvent(confirmPasswordInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('confirm-password-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should not show error when all fields are valid', async () => {
      const { getByTestId, queryByTestId } = render(<ChangePasswordForm />);
      const currentPasswordInput = getByTestId('current-password-input-input');
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');

      fireEvent.changeText(currentPasswordInput, 'CurrentPass123!');
      fireEvent(currentPasswordInput, 'blur');

      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent(newPasswordInput, 'blur');

      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');
      fireEvent(confirmPasswordInput, 'blur');

      await waitFor(() => {
        expect(queryByTestId('current-password-input-error')).toBeNull();
        expect(queryByTestId('new-password-input-error')).toBeNull();
        expect(queryByTestId('confirm-password-input-error')).toBeNull();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call updatePassword with form data on submit', async () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      const currentPasswordInput = getByTestId('current-password-input-input');
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('change-password-submit-button');

      fireEvent.changeText(currentPasswordInput, 'CurrentPass123!');
      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockUpdatePassword).toHaveBeenCalledWith(
          {
            currentPassword: 'CurrentPass123!',
            newPassword: 'NewPass123!@',
            confirmPassword: 'NewPass123!@',
          },
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          }),
        );
      });
    });

    it('should show success toast and navigate back on successful update', async () => {
      mockUpdatePassword.mockImplementation((_, options) => {
        options.onSuccess();
      });

      const { getByTestId } = render(<ChangePasswordForm />);
      const currentPasswordInput = getByTestId('current-password-input-input');
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('change-password-submit-button');

      fireEvent.changeText(currentPasswordInput, 'CurrentPass123!');
      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalledWith(
          MESSAGES.UPDATE_SUCCESS,
          MESSAGES.PASSWORD_UPDATE_SUCCESS,
          expect.arrayContaining([
            expect.objectContaining({
              text: 'OK',
              onPress: expect.any(Function),
            }),
          ]),
          expect.objectContaining({ type: 'success' }),
        );
      });
    });

    it('should call router.back when OK button is pressed in success toast', async () => {
      mockUpdatePassword.mockImplementation((_, options) => {
        options.onSuccess();
      });

      const { getByTestId } = render(<ChangePasswordForm />);
      const currentPasswordInput = getByTestId('current-password-input-input');
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('change-password-submit-button');

      fireEvent.changeText(currentPasswordInput, 'CurrentPass123!');
      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalled();
      });

      // Get the onPress callback from the toast alert call
      const toastCall = mockToastAlert.mock.calls[0];
      const buttons = toastCall[2];
      const okButton = buttons.find(
        (btn: { text: string }) => btn.text === 'OK',
      );

      // Simulate pressing OK button
      okButton.onPress();

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should show error toast on update failure with Error instance', async () => {
      const errorMessage = 'Current password is incorrect';
      mockUpdatePassword.mockImplementation((_, options) => {
        options.onError(new Error(errorMessage));
      });

      const { getByTestId } = render(<ChangePasswordForm />);
      const currentPasswordInput = getByTestId('current-password-input-input');
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('change-password-submit-button');

      fireEvent.changeText(currentPasswordInput, 'CurrentPass123!');
      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalledWith(
          ERROR_MESSAGES.UPDATE_FAILED,
          errorMessage,
          [],
          expect.objectContaining({ type: 'error' }),
        );
      });
    });

    it('should show default error message on update failure with non-Error', async () => {
      mockUpdatePassword.mockImplementation((_, options) => {
        options.onError('Some string error');
      });

      const { getByTestId } = render(<ChangePasswordForm />);
      const currentPasswordInput = getByTestId('current-password-input-input');
      const newPasswordInput = getByTestId('new-password-input-input');
      const confirmPasswordInput = getByTestId('confirm-password-input-input');
      const submitButton = getByTestId('change-password-submit-button');

      fireEvent.changeText(currentPasswordInput, 'CurrentPass123!');
      fireEvent.changeText(newPasswordInput, 'NewPass123!@');
      fireEvent.changeText(confirmPasswordInput, 'NewPass123!@');

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockToastAlert).toHaveBeenCalledWith(
          ERROR_MESSAGES.UPDATE_FAILED,
          ERROR_MESSAGES.UPDATE_PASSWORD_FAILED,
          [],
          expect.objectContaining({ type: 'error' }),
        );
      });
    });
  });

  describe('Button State', () => {
    it('should have submit button disabled when form is empty', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      const submitButton = getByTestId('change-password-submit-button');

      expect(submitButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should have submit button enabled when form is dirty', async () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      const currentPasswordInput = getByTestId('current-password-input-input');
      const submitButton = getByTestId('change-password-submit-button');

      fireEvent.changeText(currentPasswordInput, 'something');

      await waitFor(() => {
        expect(submitButton.props.accessibilityState?.disabled).toBe(false);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility labels', () => {
      const { getByLabelText, getAllByLabelText } = render(
        <ChangePasswordForm />,
      );

      expect(getByLabelText('Current Password input field')).toBeTruthy();
      expect(getByLabelText('New Password input field')).toBeTruthy();
      expect(getByLabelText('Confirm Password input field')).toBeTruthy();
      expect(getAllByLabelText('Change Password')).toBeTruthy();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should render password toggle button for current password', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      expect(
        getByTestId('current-password-input-password-toggle'),
      ).toBeTruthy();
    });

    it('should render password toggle button for new password', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      expect(getByTestId('new-password-input-password-toggle')).toBeTruthy();
    });

    it('should render password toggle button for confirm password', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      expect(
        getByTestId('confirm-password-input-password-toggle'),
      ).toBeTruthy();
    });

    it('should toggle current password visibility when toggle is pressed', () => {
      const { getByTestId } = render(<ChangePasswordForm />);
      const currentPasswordInput = getByTestId('current-password-input-input');
      const toggleButton = getByTestId(
        'current-password-input-password-toggle',
      );

      // Initially password should be hidden
      expect(currentPasswordInput.props.secureTextEntry).toBe(true);

      // Press toggle
      fireEvent.press(toggleButton);

      // Password should now be visible
      expect(currentPasswordInput.props.secureTextEntry).toBe(false);

      // Press toggle again
      fireEvent.press(toggleButton);

      // Password should be hidden again
      expect(currentPasswordInput.props.secureTextEntry).toBe(true);
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { toJSON } = render(<ChangePasswordForm />);
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
