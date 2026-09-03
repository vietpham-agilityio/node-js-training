import { render } from '@testing-library/react-native';
import ResetPasswordScreen from '../index';

// Mock dependencies
const mockReplace = jest.fn();
const mockUseLocalSearchParams = jest.fn(() => ({
  type: 'recovery',
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  router: {
    replace: mockReplace,
  },
}));

describe('ResetPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({
      type: 'recovery',
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
    });
  });

  describe('Valid Recovery Session', () => {
    it('should render match snapshot', () => {
      const { toJSON } = render(<ResetPasswordScreen />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render ResetPasswordForm when type is recovery', () => {
      const { getByTestId } = render(<ResetPasswordScreen />);
      expect(getByTestId('reset-password-form')).toBeTruthy();
    });

    it('should render reset password screen with testID', () => {
      const { getByTestId } = render(<ResetPasswordScreen />);
      expect(getByTestId('reset-password-screen')).toBeTruthy();
    });

    it('should render scroll view with testID', () => {
      const { getByTestId } = render(<ResetPasswordScreen />);
      expect(getByTestId('reset-password-scroll-view')).toBeTruthy();
    });

    it('should have correct accessibility label', () => {
      const { getByLabelText } = render(<ResetPasswordScreen />);
      expect(getByLabelText('Reset Password screen')).toBeTruthy();
    });
  });

  describe('Invalid Recovery Session', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        type: 'invalid',
        access_token: '',
        refresh_token: '',
      });
    });

    it('should render invalid link title with testID', () => {
      const { getByTestId, getByText } = render(<ResetPasswordScreen />);
      expect(getByTestId('reset-password-invalid-link-title')).toBeTruthy();
      expect(getByText('Invalid or expired reset link')).toBeTruthy();
    });

    it('should render invalid link description with testID', () => {
      const { getByTestId, getByText } = render(<ResetPasswordScreen />);
      expect(
        getByTestId('reset-password-invalid-link-description'),
      ).toBeTruthy();
      expect(
        getByText(
          'This password reset link is invalid or has expired. Please request a new one.',
        ),
      ).toBeTruthy();
    });

    it('should render "Request New Link" button with testID', () => {
      const { getByTestId, getByText } = render(<ResetPasswordScreen />);
      expect(getByTestId('request-new-link-button')).toBeTruthy();
      expect(getByText('Request New Link')).toBeTruthy();
    });
  });
});
