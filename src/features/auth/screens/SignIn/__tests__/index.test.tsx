import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { StatusBar } from 'expo-status-bar';

//
import LoginScreen from '../index';

// Mock dependencies
const mockSignIn = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockSignInWithFacebook = jest.fn();
const mockToastAlert = jest.fn();
const mockPush = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  router: {
    push: mockPush,
  },
  Link: ({ children, href }: any) => children,
}));

jest.mock('@/features/auth/hooks/useSignIn', () => ({
  useSignIn: () => ({
    mutate: mockSignIn,
    isPending: false,
  }),
  useSignInWithGoogle: () => ({
    mutate: mockSignInWithGoogle,
    isPending: false,
  }),
  useSignInWithFacebook: () => ({
    mutate: mockSignInWithFacebook,
    isPending: false,
  }),
}));

jest.mock('@/hooks/useToast', () => ({
  useToastAlert: () => ({
    alert: mockToastAlert,
  }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = render(<LoginScreen />);
      expect(getByText('Welcome Back,')).toBeTruthy();
    });

    it('should render welcome message', () => {
      const { getByText } = render(<LoginScreen />);
      expect(getByText('Welcome Back,')).toBeTruthy();
      expect(getByText('Movie Lover!')).toBeTruthy();
    });

    it('should render app icon', () => {
      const { getByTestId } = render(<LoginScreen />);
      expect(getByTestId('app-icon')).toBeTruthy();
    });

    it('should render SignInForm', () => {
      const { getByTestId } = render(<LoginScreen />);
      expect(getByTestId('signin-form')).toBeTruthy();
    });

    it('should render "Create new account?" text', () => {
      const { getByText } = render(<LoginScreen />);
      expect(getByText('Create new account?')).toBeTruthy();
    });

    it('should render "Sign Up" link', () => {
      const { getByText } = render(<LoginScreen />);
      expect(getByText('Sign Up')).toBeTruthy();
    });

    it('should render third-party sign-in buttons', () => {
      const { getByTestId } = render(<LoginScreen />);
      expect(getByTestId('signin-google-button')).toBeTruthy();
      expect(getByTestId('signin-facebook-button')).toBeTruthy();
    });

    it('should render StatusBar', () => {
      const { UNSAFE_getByType } = render(<LoginScreen />);
      const statusBar = UNSAFE_getByType(StatusBar);
      expect(statusBar).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    const fillFormAndSubmit = async (
      getByTestId: ReturnType<typeof render>['getByTestId'],
    ) => {
      const emailInput = getByTestId('signin-email-input');
      const passwordInput = getByTestId('signin-password-input');
      const submitButton = getByTestId('signin-submit-button');

      // Fill in valid form data
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent(emailInput, 'blur');
      fireEvent.changeText(passwordInput, 'Password123!');
      fireEvent(passwordInput, 'blur');

      // Wait for form state to update, then press submit
      await waitFor(() => {
        fireEvent.press(submitButton);
      });

      // Wait for form validation and submission
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    };

    it('should call signIn mutation when form is submitted', async () => {
      const { getByTestId } = render(<LoginScreen />);

      await fillFormAndSubmit(getByTestId);

      expect(mockSignIn).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'Password123!' },
        expect.objectContaining({
          onError: expect.any(Function),
        }),
      );
    });

    it('should show error toast when signIn fails', async () => {
      const { getByTestId } = render(<LoginScreen />);

      await fillFormAndSubmit(getByTestId);

      // Get the onError callback
      const signInCall = mockSignIn.mock.calls[0];
      const onErrorCallback = signInCall[1].onError;

      // Execute error callback
      const error = new Error('Invalid credentials');
      onErrorCallback(error);

      expect(mockToastAlert).toHaveBeenCalledWith(
        'Login failed. Please try again.',
        'Invalid credentials',
        [],
        {
          type: 'error',
        },
      );
    });

    it('should show default error message when error has no message', async () => {
      const { getByTestId } = render(<LoginScreen />);

      await fillFormAndSubmit(getByTestId);

      const signInCall = mockSignIn.mock.calls[0];
      const onErrorCallback = signInCall[1].onError;

      const error = new Error('');
      onErrorCallback(error);

      expect(mockToastAlert).toHaveBeenCalledWith(
        'Login failed. Please try again.',
        'Invalid email or password. Please try again.',
        [],
        {
          type: 'error',
        },
      );
    });
  });

  describe('Third-Party Sign In', () => {
    it('should call signInWithGoogle when Google button is pressed', () => {
      const { getByTestId } = render(<LoginScreen />);
      const googleButton = getByTestId('signin-google-button');

      fireEvent.press(googleButton);

      expect(mockSignInWithGoogle).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          onError: expect.any(Function),
        }),
      );
    });

    it('should show error toast when Google sign in fails', () => {
      const { getByTestId } = render(<LoginScreen />);
      const googleButton = getByTestId('signin-google-button');

      fireEvent.press(googleButton);

      const googleCall = mockSignInWithGoogle.mock.calls[0];
      const onErrorCallback = googleCall[1].onError;

      const error = new Error('Google sign in failed');
      onErrorCallback(error);

      expect(mockToastAlert).toHaveBeenCalledWith(
        'Google Sign In Failed',
        'Google sign in failed',
        [],
        {
          type: 'error',
        },
      );
    });

    it('should call signInWithFacebook when Facebook button is pressed', () => {
      const { getByTestId } = render(<LoginScreen />);
      const facebookButton = getByTestId('signin-facebook-button');

      fireEvent.press(facebookButton);

      expect(mockSignInWithFacebook).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          onError: expect.any(Function),
        }),
      );
    });

    it('should show error toast when Facebook sign in fails', () => {
      const { getByTestId } = render(<LoginScreen />);
      const facebookButton = getByTestId('signin-facebook-button');

      fireEvent.press(facebookButton);

      const facebookCall = mockSignInWithFacebook.mock.calls[0];
      const onErrorCallback = facebookCall[1].onError;

      const error = new Error('Facebook sign in failed');
      onErrorCallback(error);

      expect(mockToastAlert).toHaveBeenCalledWith(
        'Facebook Sign In Failed',
        'Facebook sign in failed',
        [],
        {
          type: 'error',
        },
      );
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility labels', () => {
      const { getByLabelText } = render(<LoginScreen />);

      expect(getByLabelText('Welcome back, Movie Lover!')).toBeTruthy();
      expect(getByLabelText('Sign up')).toBeTruthy();
    });

    it('should have correct accessibility hints', () => {
      const { getByLabelText } = render(<LoginScreen />);
      const signUpLink = getByLabelText('Sign up');

      expect(signUpLink.props.accessibilityHint).toBe(
        'Navigates to the Sign up screen',
      );
    });
  });
});
