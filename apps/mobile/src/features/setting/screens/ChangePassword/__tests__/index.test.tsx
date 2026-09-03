import { render } from '@testing-library/react-native';

// Screen
import ChangePasswordScreen from '../';

// Mock dependencies
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock('@/hooks/useToast', () => ({
  useToastAlert: () => ({
    alert: jest.fn(),
  }),
}));

jest.mock('@/hooks/useSession', () => ({
  useUpdatePassword: () => ({
    mutate: jest.fn(),
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

describe('ChangePasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<ChangePasswordScreen />);
      expect(getByTestId('current-password-input')).toBeTruthy();
    });

    it('should render ChangePasswordForm', () => {
      const { getByTestId } = render(<ChangePasswordScreen />);

      expect(getByTestId('current-password-input')).toBeTruthy();
      expect(getByTestId('new-password-input')).toBeTruthy();
      expect(getByTestId('confirm-password-input')).toBeTruthy();
      expect(getByTestId('change-password-submit-button')).toBeTruthy();
    });

    it('should render all password input fields', () => {
      const { getByText } = render(<ChangePasswordScreen />);

      expect(getByText('Current Password')).toBeTruthy();
      expect(getByText('Password')).toBeTruthy();
      expect(getByText('Confirm Password')).toBeTruthy();
    });

    it('should render submit button', () => {
      const { getByText } = render(<ChangePasswordScreen />);
      expect(getByText('Change Password')).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { toJSON } = render(<ChangePasswordScreen />);
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
