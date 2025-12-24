import { render, waitFor } from '@testing-library/react-native';
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

jest.mock('@/features/auth/components/SignUpForm', () => {
  const { View } = require('react-native');
  return {
    SignUpForm: ({ isPending, onSubmit }: any) => (
      <View testID="signup-form" data-pending={isPending}>
        <View
          testID="submit-trigger"
          onPress={() =>
            onSubmit({
              fullName: 'John Doe',
              email: 'john@example.com',
              password: 'Password123!',
              avatarUrl: 'https://example.com/avatar.jpg',
            })
          }
        />
      </View>
    ),
  };
});

jest.mock('@/layouts/AccessLayout', () => {
  const { View } = require('react-native');
  return {
    AccessLayout: ({ children, loading }: any) => (
      <View testID="access-layout" data-loading={loading}>
        {children}
      </View>
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
      expect(form.props['data-pending']).toBe(false);
    });

    it('should pass loading state to AccessLayout', () => {
      const { getByTestId } = render(<SignupScreen />);
      const layout = getByTestId('access-layout');
      expect(layout.props['data-loading']).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should call setSigningUp(true) when form is submitted', async () => {
      const { getByTestId } = render(<SignupScreen />);
      const submitTrigger = getByTestId('submit-trigger');

      // Simulate form submission
      submitTrigger.props.onPress();

      await waitFor(() => {
        expect(mockSetSigningUp).toHaveBeenCalledWith(true);
      });
    });

    it('should call signUp with correct data', async () => {
      const { getByTestId } = render(<SignupScreen />);
      const submitTrigger = getByTestId('submit-trigger');

      submitTrigger.props.onPress();

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'Password123!',
          fullName: 'John Doe',
        });
      });
    });

    it('should call uploadAvatar when avatarUrl is provided', async () => {
      const { getByTestId } = render(<SignupScreen />);
      const submitTrigger = getByTestId('submit-trigger');

      submitTrigger.props.onPress();

      await waitFor(() => {
        expect(mockUploadAvatar).toHaveBeenCalledWith({
          userId: '1',
          file: {
            uri: 'https://example.com/avatar.jpg',
          },
        });
      });
    });

    it('should not call uploadAvatar when avatarUrl is not provided', async () => {
      jest.doMock('@/features/auth/components/SignUpForm', () => {
        const { View } = require('react-native');
        return {
          SignUpForm: ({ isPending, onSubmit }: any) => (
            <View testID="signup-form" data-pending={isPending}>
              <View
                testID="submit-trigger"
                onPress={() =>
                  onSubmit({
                    fullName: 'John Doe',
                    email: 'john@example.com',
                    password: 'Password123!',
                    avatarUrl: undefined,
                  })
                }
              />
            </View>
          ),
        };
      });

      const SignupScreenModule = require('../index').default;
      const { getByTestId } = render(<SignupScreenModule />);
      const submitTrigger = getByTestId('submit-trigger');

      submitTrigger.props.onPress();

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
        expect(mockUploadAvatar).not.toHaveBeenCalled();
      });
    });

    it('should show error toast when avatar upload fails', async () => {
      mockUploadAvatar.mockRejectedValue(new Error('Upload failed'));

      const { getByTestId } = render(<SignupScreen />);
      const submitTrigger = getByTestId('submit-trigger');

      submitTrigger.props.onPress();

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to update profile');
      });
    });

    it('should call setSigningUp(false) after submission', async () => {
      const { getByTestId } = render(<SignupScreen />);
      const submitTrigger = getByTestId('submit-trigger');

      submitTrigger.props.onPress();

      await waitFor(() => {
        expect(mockSetSigningUp).toHaveBeenCalledWith(false);
      });
    });
  });
});
