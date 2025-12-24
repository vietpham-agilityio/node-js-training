import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TextInput } from 'react-native';

// Component
import { ResetPasswordForm } from '../';

// Mock dependencies
const mockSignOut = jest.fn();
const mockToastAlert = jest.fn();
const mockSetSession = jest.fn();
const mockUpdatePassword = jest.fn();

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
      setSession: mockSetSession,
    },
  },
}));

jest.mock('@/features/auth/services/auth', () => ({
  authService: {
    updatePassword: mockUpdatePassword,
  },
}));

describe('ResetPasswordForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetSession.mockResolvedValue({ error: null });
    mockUpdatePassword.mockResolvedValue(undefined);
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
  });

  it('should show validation error when passwords do not match', async () => {
    const { getByTestId, queryByTestId } = render(<ResetPasswordForm />);
    const newPasswordInput = getByTestId('new-password-input-input');
    const confirmPasswordInput = getByTestId('confirm-password-input-input');

    fireEvent.changeText(newPasswordInput, 'NewPass123!@');
    fireEvent(newPasswordInput, 'blur');

    fireEvent.changeText(confirmPasswordInput, 'DifferentPass123!@');
    fireEvent(confirmPasswordInput, 'blur');

    await waitFor(() => {
      const errorMessage = queryByTestId('confirm-password-input-error');
      expect(errorMessage).toBeTruthy();
    });
  });
});

describe('Accessibility', () => {
  it('should have correct accessibility labels', () => {
    const { getByLabelText } = render(<ResetPasswordForm />);

    expect(getByLabelText('New Password input field')).toBeTruthy();
    expect(getByLabelText('Confirm Password input field')).toBeTruthy();
    expect(getByLabelText('Reset Password')).toBeTruthy();
  });
});
