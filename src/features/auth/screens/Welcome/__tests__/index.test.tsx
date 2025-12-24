import { fireEvent, render } from '@testing-library/react-native';
import { ActivityIndicator } from 'react-native';
import WelcomeScreen from '../index';

import { useProfile } from '@/features/setting/hooks/useProfile';

// Mock dependencies
const mockReplace = jest.fn();
const mockProfile = {
  id: '1',
  fullName: 'John Doe',
  avatarUrl: 'https://example.com/avatar.jpg',
};

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@/features/setting/hooks/useProfile', () => ({
  useProfile: jest.fn(),
}));

jest.mock('@/layouts/AccessLayout', () => {
  const { View } = require('react-native');
  return {
    AccessLayout: ({ children }: any) => (
      <View testID="access-layout">{children}</View>
    ),
  };
});

jest.mock('@/components/Avatar', () => {
  const { View } = require('react-native');
  return {
    Avatar: ({ source, accessibilityLabel }: any) => (
      <View testID="avatar" accessibilityLabel={accessibilityLabel}>
        {source}
      </View>
    ),
  };
});

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading indicator when profile is loading', () => {
      (useProfile as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
      });

      const { UNSAFE_getByType } = render(<WelcomeScreen />);
      const activityIndicator = UNSAFE_getByType(ActivityIndicator);

      expect(activityIndicator).toBeTruthy();
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      (useProfile as jest.Mock).mockReturnValue({
        data: mockProfile,
        isLoading: false,
      });
    });

    it('should render without crashing', () => {
      const { getByText } = render(<WelcomeScreen />);
      expect(getByText('Welcome')).toBeTruthy();
    });

    it('should render welcome message', () => {
      const { getByText } = render(<WelcomeScreen />);
      expect(getByText('Welcome')).toBeTruthy();
    });

    it('should render user full name', () => {
      const { getByText } = render(<WelcomeScreen />);
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should render avatar', () => {
      const { getByTestId } = render(<WelcomeScreen />);
      expect(getByTestId('avatar')).toBeTruthy();
    });

    it('should render "Explore Movies" button', () => {
      const { getByText } = render(<WelcomeScreen />);
      expect(getByText('Explore Movies')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      (useProfile as jest.Mock).mockReturnValue({
        data: mockProfile,
        isLoading: false,
      });
    });

    it('should navigate to home when "Explore Movies" button is pressed', () => {
      const { getByLabelText } = render(<WelcomeScreen />);
      const exploreButton = getByLabelText('Explore movies');

      fireEvent.press(exploreButton);

      expect(mockReplace).toHaveBeenCalledWith('/(main)/(tabs)');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useProfile as jest.Mock).mockReturnValue({
        data: mockProfile,
        isLoading: false,
      });
    });

    it('should have correct accessibility hints', () => {
      const { getByLabelText } = render(<WelcomeScreen />);
      const button = getByLabelText('Explore movies');

      expect(button.props.accessibilityHint).toBe(
        'Explore Movies and continues to the home screen',
      );
    });
  });

  describe('Profile Data', () => {
    it('should display profile full name when available', () => {
      (useProfile as jest.Mock).mockReturnValue({
        data: mockProfile,
        isLoading: false,
      });

      const { getByText } = render(<WelcomeScreen />);
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should handle missing profile data', () => {
      (useProfile as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
      });

      const { getByText } = render(<WelcomeScreen />);
      expect(getByText('Welcome')).toBeTruthy();
    });
  });
});
