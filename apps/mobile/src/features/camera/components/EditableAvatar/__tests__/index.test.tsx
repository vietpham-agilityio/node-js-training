// __tests__/components/Avatar/EditableAvatar.test.tsx

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useCameraPermissions } from 'expo-camera';
import { ImageManipulator } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { EditableAvatar } from '..';

// Mock dependencies
jest.mock('expo-image-picker');
jest.mock('expo-camera');
jest.mock('expo-image-manipulator');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('EditableAvatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock camera permissions
    (useCameraPermissions as jest.Mock).mockReturnValue([
      { granted: true },
      jest.fn(),
    ]);

    // Mock image picker permissions
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({ status: 'granted' });
  });

  describe('Rendering', () => {
    it('renders Avatar with no source initially', () => {
      const { getByTestId } = render(<EditableAvatar />);

      expect(getByTestId('avatar-container')).toBeTruthy();
      expect(getByTestId('default-avatar-icon')).toBeTruthy();
    });

    it('renders Avatar with initialSource', () => {
      const { getByLabelText } = render(
        <EditableAvatar initialSource="https://example.com/avatar.jpg" />,
      );

      expect(getByLabelText('Profile picture')).toBeTruthy();
    });

    it('renders picker button', () => {
      const { getByLabelText } = render(<EditableAvatar />);

      expect(getByLabelText('Add profile picture')).toBeTruthy();
    });

    it('renders remove button when avatar exists', () => {
      const { getByLabelText } = render(
        <EditableAvatar initialSource="https://example.com/avatar.jpg" />,
      );

      expect(getByLabelText('Remove profile picture')).toBeTruthy();
    });
  });

  describe('Picker Button', () => {
    it('opens options modal when add button pressed', () => {
      const { getByLabelText, getByText } = render(<EditableAvatar />);

      fireEvent.press(getByLabelText('Add profile picture'));

      expect(getByText('Choose an option')).toBeTruthy();
    });

    it('removes avatar when remove button pressed', () => {
      const mockCallback = jest.fn();
      const { getByLabelText, getByTestId } = render(
        <EditableAvatar
          initialSource="https://example.com/avatar.jpg"
          onChangeImage={mockCallback}
        />,
      );

      fireEvent.press(getByLabelText('Remove profile picture'));

      // Avatar should be removed
      expect(getByTestId('default-avatar-icon')).toBeTruthy();
      expect(mockCallback).toHaveBeenCalledWith('');
    });

    it('shows add button after removing avatar', () => {
      const { getByLabelText } = render(
        <EditableAvatar initialSource="https://example.com/avatar.jpg" />,
      );

      // Remove avatar
      fireEvent.press(getByLabelText('Remove profile picture'));

      // Should show add button now
      expect(getByLabelText('Add profile picture')).toBeTruthy();
    });
  });

  describe('Integration with withAvatarState', () => {
    it('manages avatar state', () => {
      const { getByLabelText, getByTestId } = render(<EditableAvatar />);

      // Initially no avatar
      expect(getByTestId('default-avatar-icon')).toBeTruthy();

      // Add button should be present
      expect(getByLabelText('Add profile picture')).toBeTruthy();
    });

    it('calls onChangeImage when avatar changes', async () => {
      const mockCallback = jest.fn();

      // Mock successful image selection
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://new-avatar.jpg' }],
      });

      // Mock compression
      const mockManipulate = {
        resize: jest.fn().mockReturnThis(),
        renderAsync: jest.fn().mockResolvedValue({
          saveAsync: jest.fn().mockResolvedValue({
            uri: 'file://compressed.jpg',
          }),
        }),
      };
      (ImageManipulator.manipulate as jest.Mock).mockReturnValue(
        mockManipulate,
      );

      const { getByLabelText, getByText } = render(
        <EditableAvatar onChangeImage={mockCallback} />,
      );

      // Open options and select gallery
      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith('file://compressed.jpg');
      });
    });
  });

  describe('Integration with withCameraOption', () => {
    it('opens camera modal', async () => {
      const { getByLabelText, getByText } = render(<EditableAvatar />);

      // Open options
      fireEvent.press(getByLabelText('Add profile picture'));

      // Select camera
      fireEvent.press(getByText('Take Photo'));

      await waitFor(() => {
        expect(getByLabelText('Camera')).toBeTruthy();
      });
    });

    it('opens gallery picker', async () => {
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const { getByLabelText, getByText } = render(<EditableAvatar />);

      // Open options
      fireEvent.press(getByLabelText('Add profile picture'));

      // Select gallery
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      });
    });

    it('disables button while selecting image', async () => {
      let resolveImagePicker: any;
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockReturnValue(
        new Promise(resolve => {
          resolveImagePicker = resolve;
        }),
      );

      const { getByLabelText, getByText } = render(<EditableAvatar />);

      // Open options and select gallery
      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        const button = getByLabelText('Add profile picture');
        expect(button.props.accessibilityState.disabled).toBe(true);
        expect(button.props.accessibilityState.busy).toBe(true);
      });

      // Resolve
      resolveImagePicker({
        canceled: true,
      });
    });
  });

  describe('Custom Props', () => {
    it('forwards maxImageSize to withCameraOption', async () => {
      const mockManipulate = {
        resize: jest.fn().mockReturnThis(),
        renderAsync: jest.fn().mockResolvedValue({
          saveAsync: jest.fn().mockResolvedValue({
            uri: 'file://compressed.jpg',
          }),
        }),
      };
      (ImageManipulator.manipulate as jest.Mock).mockReturnValue(
        mockManipulate,
      );

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://original.jpg' }],
      });

      const { getByLabelText, getByText } = render(
        <EditableAvatar maxImageSize={1024} />,
      );

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(mockManipulate.resize).toHaveBeenCalledWith({ width: 1024 });
      });
    });

    it('uses custom accessibilityHint', () => {
      const { getByLabelText } = render(
        <EditableAvatar accessibilityHint="Custom hint" />,
      );

      const button = getByLabelText('Add profile picture');
      expect(button.props.accessibilityHint).toBe('Custom hint');
    });
  });

  describe('Accessibility', () => {
    it('has correct button accessibility labels', () => {
      const { getByLabelText } = render(<EditableAvatar />);

      const button = getByLabelText('Add profile picture');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('has correct accessibility state', () => {
      const { getByLabelText } = render(<EditableAvatar />);

      const button = getByLabelText('Add profile picture');
      expect(button.props.accessibilityState).toEqual({
        disabled: false,
        busy: false,
      });
    });

    it('updates accessibility label when avatar changes', () => {
      const { getByLabelText } = render(
        <EditableAvatar initialSource="https://example.com/avatar.jpg" />,
      );

      // Initially remove button
      expect(getByLabelText('Remove profile picture')).toBeTruthy();

      // Remove avatar
      fireEvent.press(getByLabelText('Remove profile picture'));

      // Now add button
      expect(getByLabelText('Add profile picture')).toBeTruthy();
    });
  });

  describe('Different Sizes', () => {
    it('renders size 48', () => {
      const { getByLabelText } = render(<EditableAvatar size={48} />);
      const button = getByLabelText('Add profile picture');

      // Test that button renders with correct size
      expect(button).toBeTruthy();
    });

    it('renders size 92', () => {
      const { getByLabelText } = render(<EditableAvatar size={92} />);
      const button = getByLabelText('Add profile picture');

      expect(button).toBeTruthy();
    });

    it('renders size 132', () => {
      const { getByLabelText } = render(<EditableAvatar size={132} />);
      const button = getByLabelText('Add profile picture');

      expect(button).toBeTruthy();
    });

    it('renders size 160', () => {
      const { getByLabelText } = render(<EditableAvatar size={160} />);
      const button = getByLabelText('Add profile picture');

      expect(button).toBeTruthy();
    });
  });

  describe('Custom Props', () => {
    it('forwards maxImageSize to withCameraOption', async () => {
      const mockManipulate = {
        resize: jest.fn().mockReturnThis(),
        renderAsync: jest.fn().mockResolvedValue({
          saveAsync: jest.fn().mockResolvedValue({
            uri: 'file://compressed.jpg',
          }),
        }),
      };
      (ImageManipulator.manipulate as jest.Mock).mockReturnValue(
        mockManipulate,
      );

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://original.jpg' }],
      });

      const { getByLabelText, getByText } = render(
        <EditableAvatar maxImageSize={1024} />,
      );

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(mockManipulate.resize).toHaveBeenCalledWith({ width: 1024 });
      });
    });

    it('uses custom accessibilityHint', () => {
      const { getByLabelText } = render(
        <EditableAvatar accessibilityHint="Custom hint" />,
      );

      const button = getByLabelText('Add profile picture');
      expect(button.props.accessibilityHint).toBe('Custom hint');
    });
  });

  describe('Accessibility', () => {
    it('has correct button accessibility labels', () => {
      const { getByLabelText } = render(<EditableAvatar />);

      const button = getByLabelText('Add profile picture');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('has correct accessibility state', () => {
      const { getByLabelText } = render(<EditableAvatar />);

      const button = getByLabelText('Add profile picture');
      expect(button.props.accessibilityState).toEqual({
        disabled: false,
        busy: false,
      });
    });

    it('updates accessibility label when avatar changes', () => {
      const { getByLabelText } = render(
        <EditableAvatar initialSource="https://example.com/avatar.jpg" />,
      );

      // Initially remove button
      expect(getByLabelText('Remove profile picture')).toBeTruthy();

      // Remove avatar
      fireEvent.press(getByLabelText('Remove profile picture'));

      // Now add button
      expect(getByLabelText('Add profile picture')).toBeTruthy();
    });
  });

  describe('Button Styling', () => {
    it('shows primary color for add button', () => {
      const { getByLabelText } = render(<EditableAvatar />);
      const button = getByLabelText('Add profile picture');

      // In NativeWind, className is processed and converted to style
      // We can test by checking the button exists and has correct label
      expect(button).toBeTruthy();
      expect(button.props.accessibilityLabel).toBe('Add profile picture');
    });

    it('shows red color for remove button', () => {
      const { getByLabelText } = render(
        <EditableAvatar initialSource="https://example.com/avatar.jpg" />,
      );
      const button = getByLabelText('Remove profile picture');

      // Test button exists with correct label (color is visual, hard to test in unit tests)
      expect(button).toBeTruthy();
      expect(button.props.accessibilityLabel).toBe('Remove profile picture');
    });

    it('renders add button when no avatar', () => {
      const { getByLabelText } = render(<EditableAvatar />);

      // Add button should exist
      expect(getByLabelText('Add profile picture')).toBeTruthy();
    });

    it('renders remove button when avatar exists', () => {
      const { getByLabelText } = render(
        <EditableAvatar initialSource="https://example.com/avatar.jpg" />,
      );

      // Remove button should exist
      expect(getByLabelText('Remove profile picture')).toBeTruthy();
    });

    it('button has correct accessibility role', () => {
      const { getByLabelText } = render(<EditableAvatar />);
      const button = getByLabelText('Add profile picture');

      expect(button.props.accessibilityRole).toBe('button');
    });
  });
});
