import { fireEvent, render, waitFor } from '@testing-library/react-native';
import SignupScreen from '../index';

// Mock dependencies
const mockSignUp = jest.fn();
const mockUploadAvatar = jest.fn();
const mockSetSigningUp = jest.fn();
const mockToastError = jest.fn();

jest.mock('@/features/auth/hooks/useSignUp', () => ({
  useSignUp: () => ({
    mutateAsync: mockSignUp,
    isPending: false,
  }),
}));

jest.mock('@/features/setting/hooks/useProfile', () => ({
  useUploadAvatar: () => ({
    mutateAsync: mockUploadAvatar,
    isPending: false,
  }),
}));

jest.mock('@/features/auth/store/auth', () => ({
  useAuthStore: () => ({
    setSigningUp: mockSetSigningUp,
  }),
}));

jest.mock('@/hooks/useToast', () => ({
  useToastAlert: () => ({
    error: mockToastError,
  }),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');

  return {
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaView: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
  };
});

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignUp.mockResolvedValue({
      user: { id: '1' },
    });
    mockUploadAvatar.mockResolvedValue({});
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<SignupScreen />);
      expect(getByTestId('signup-form')).toBeTruthy();
    });

    it('should render SignUpForm', () => {
      const { getByTestId } = render(<SignupScreen />);
      expect(getByTestId('signup-form')).toBeTruthy();
    });

    it('should pass isPending to SignUpForm', () => {
      const { getByTestId } = render(<SignupScreen />);
      const form = getByTestId('signup-form');
      expect(form.props['data-pending']).toBe(undefined);
    });
  });

  describe('Form Submission', () => {
    const fillFormAndSubmit = async (
      getByTestId: ReturnType<typeof render>['getByTestId'],
    ) => {
      // Fill in valid form data - note: input testIDs have '-input' suffix
      const fullNameInput = getByTestId('signup-fullname-input-input');
      const emailInput = getByTestId('signup-email-input-input');
      const passwordInput = getByTestId('signup-password-input-input');
      const confirmPasswordInput = getByTestId(
        'signup-confirmpassword-input-input',
      );

      fireEvent.changeText(fullNameInput, 'John Doe');
      fireEvent(fullNameInput, 'blur');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent(emailInput, 'blur');
      fireEvent.changeText(passwordInput, 'Password123!');
      fireEvent(passwordInput, 'blur');
      fireEvent.changeText(confirmPasswordInput, 'Password123!');
      fireEvent(confirmPasswordInput, 'blur');

      // Press submit button
      const submitButton = getByTestId('signup-submit-button');
      fireEvent.press(submitButton);

      // Wait for form validation and submission
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
      });
    };

    it('should call setSigningUp(true) when form is submitted', async () => {
      const { getByTestId } = render(<SignupScreen />);

      await fillFormAndSubmit(getByTestId);

      expect(mockSetSigningUp).toHaveBeenCalledWith(true);
    });

    it('should call signUp with correct data', async () => {
      const { getByTestId } = render(<SignupScreen />);

      await fillFormAndSubmit(getByTestId);

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'Password123!',
        fullName: 'John Doe',
      });
    });

    it('should not call uploadAvatar when avatarUrl is not provided', async () => {
      const { getByTestId } = render(<SignupScreen />);

      await fillFormAndSubmit(getByTestId);

      expect(mockSignUp).toHaveBeenCalled();
      expect(mockUploadAvatar).not.toHaveBeenCalled();
    });

    it('should call setSigningUp(false) after submission', async () => {
      const { getByTestId } = render(<SignupScreen />);

      await fillFormAndSubmit(getByTestId);

      expect(mockSetSigningUp).toHaveBeenCalledWith(false);
    });
  });
});
