import { fireEvent, render } from '@testing-library/react-native';
import OnboardingScreen from '../index';

// Mock dependencies
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<OnboardingScreen />);
      expect(getByTestId('on-boarding-app-icon')).toBeTruthy();
    });

    it('should render app icon container with testID', () => {
      const { getByTestId } = render(<OnboardingScreen />);
      expect(getByTestId('on-boarding-app-icon')).toBeTruthy();
    });

    it('should render title with testID', () => {
      const { getByTestId, getByText } = render(<OnboardingScreen />);
      expect(getByTestId('on-boarding-title')).toBeTruthy();
      expect(getByText('New Experience')).toBeTruthy();
    });

    it('should render description text with testID', () => {
      const { getByTestId, getByText } = render(<OnboardingScreen />);
      expect(getByTestId('on-boarding-description')).toBeTruthy();
      expect(
        getByText('Watch a new movie much easier than any before'),
      ).toBeTruthy();
    });

    it('should render "Get Started" button with testID', () => {
      const { getByTestId, getByText } = render(<OnboardingScreen />);
      expect(getByTestId('get-started-button')).toBeTruthy();
      expect(getByText('Get Started')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to login when "Get Started" button is pressed', () => {
      const { getByTestId } = render(<OnboardingScreen />);
      const getStartedButton = getByTestId('get-started-button');

      fireEvent.press(getStartedButton);

      expect(mockPush).toHaveBeenCalledWith('/(auth)/signin');
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility labels', () => {
      const { getByLabelText } = render(<OnboardingScreen />);

      expect(getByLabelText('App logo')).toBeTruthy();
      expect(getByLabelText('Get started')).toBeTruthy();
    });

    it('should have correct accessibility hints', () => {
      const { getByLabelText } = render(<OnboardingScreen />);
      const button = getByLabelText('Get started');

      expect(button.props.accessibilityHint).toBe('Go to sign in screen');
    });
  });
});
