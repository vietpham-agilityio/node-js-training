import { fireEvent, render, waitFor } from '@testing-library/react-native';
import SignupScreen from '../index';

// Mock dependencies
const mockSignUp = jest.fn();

jest.mock('@/features/auth/hooks/useSignUp', () => ({
  useSignUp: () => ({
    mutate: mockSignUp,
    isPending: false,
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
  });

  describe('Form Submission', () => {
    const fillFormAndSubmit = async (
      getByTestId: ReturnType<typeof render>['getByTestId'],
    ) => {
      // input testIDs have an '-input' suffix
      const firstNameInput = getByTestId('signup-firstname-input-input');
      const lastNameInput = getByTestId('signup-lastname-input-input');
      const emailInput = getByTestId('signup-email-input-input');
      const passwordInput = getByTestId('signup-password-input-input');
      const confirmPasswordInput = getByTestId(
        'signup-confirmpassword-input-input',
      );

      fireEvent.changeText(firstNameInput, 'John');
      fireEvent(firstNameInput, 'blur');
      fireEvent.changeText(lastNameInput, 'Doe');
      fireEvent(lastNameInput, 'blur');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent(emailInput, 'blur');
      fireEvent.changeText(passwordInput, 'Password123!');
      fireEvent(passwordInput, 'blur');
      fireEvent.changeText(confirmPasswordInput, 'Password123!');
      fireEvent(confirmPasswordInput, 'blur');

      const submitButton = getByTestId('signup-submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
      });
    };

    it('should call signUp with the first/last name payload', async () => {
      const { getByTestId } = render(<SignupScreen />);

      await fillFormAndSubmit(getByTestId);

      expect(mockSignUp).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
      });
    });
  });
});
