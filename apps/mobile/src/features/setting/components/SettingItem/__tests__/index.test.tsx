import { fireEvent, render } from '@testing-library/react-native';

// Component
import { SettingItem } from '../';

// Icons
import { ArrowBackIcon } from '@/icons/ArrowBackIcon';

describe('SettingItem Component', () => {
  const mockOnPress = jest.fn();

  const defaultProps = {
    testID: 'setting-item',
    title: 'Edit Profile',
    onPress: mockOnPress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<SettingItem {...defaultProps} />);
      expect(getByTestId('setting-item')).toBeTruthy();
    });

    it('should display title text', () => {
      const { getByText } = render(<SettingItem {...defaultProps} />);
      expect(getByText('Edit Profile')).toBeTruthy();
    });

    it('should render with icon when provided', () => {
      const { getByTestId } = render(
        <SettingItem {...defaultProps} icon={ArrowBackIcon} />,
      );
      expect(getByTestId('setting-item')).toBeTruthy();
    });

    it('should render without icon when not provided', () => {
      const { getByTestId, getByText } = render(
        <SettingItem {...defaultProps} />,
      );
      expect(getByTestId('setting-item')).toBeTruthy();
      expect(getByText('Edit Profile')).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('should call onPress when pressed', () => {
      const { getByTestId } = render(<SettingItem {...defaultProps} />);
      const settingItem = getByTestId('setting-item');

      fireEvent.press(settingItem);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not crash when onPress is not provided', () => {
      const { getByTestId } = render(
        <SettingItem testID="setting-item" title="Test" />,
      );
      const settingItem = getByTestId('setting-item');

      expect(() => fireEvent.press(settingItem)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label', () => {
      const { getByLabelText } = render(<SettingItem {...defaultProps} />);
      expect(getByLabelText('Edit Profile setting')).toBeTruthy();
    });

    it('should have accessibility hint', () => {
      const { getByTestId } = render(<SettingItem {...defaultProps} />);
      const settingItem = getByTestId('setting-item');

      expect(settingItem.props.accessibilityHint).toBe('Tap to open setting');
    });

    it('should be accessible', () => {
      const { getByTestId } = render(<SettingItem {...defaultProps} />);
      const settingItem = getByTestId('setting-item');

      expect(settingItem.props.accessible).toBe(true);
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { toJSON } = render(<SettingItem {...defaultProps} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot with icon', () => {
      const { toJSON } = render(
        <SettingItem {...defaultProps} icon={ArrowBackIcon} />,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
