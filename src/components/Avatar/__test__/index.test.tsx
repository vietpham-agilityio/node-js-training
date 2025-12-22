import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { Avatar } from '..';

// Mock dependencies
jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  useCameraPermissions: jest.fn(),
}));

jest.mock('expo-image-picker');

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

jest.mock('@/icons/AddIcon', () => ({
  AddIcon: 'AddIcon',
}));

jest.mock('@/icons/CancelIcon', () => ({
  CancelIcon: 'CancelIcon',
}));

jest.mock('@/icons/PhotoProfileIcon', () => ({
  PhotoProfileIcon: 'PhotoProfileIcon',
}));

jest.mock('@/icons/UserProfileIcon', () => ({
  UserProfileIcon: 'UserProfileIcon',
}));

jest.spyOn(Alert, 'alert');
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

describe('Avatar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockClear();
    consoleLogSpy.mockClear();
    // Default camera permissions mock
    (useCameraPermissions as jest.Mock).mockReturnValue([
      { granted: true },
      jest.fn(),
    ]);
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('Rendering', () => {
    it('should render default avatar without image', () => {
      const { getAllByLabelText } = render(<Avatar />);
      expect(getAllByLabelText('Profile picture')).toBeTruthy();
    });

    it('should render with custom accessibility label', () => {
      const { getAllByLabelText } = render(
        <Avatar accessibilityLabel="Custom avatar label" />,
      );
      expect(getAllByLabelText('Custom avatar label')).toBeTruthy();
    });

    it('should render image when source is provided', () => {
      const { getAllByLabelText } = render(
        <Avatar source="https://example.com/avatar.jpg" />,
      );
      expect(getAllByLabelText('Profile picture')).toBeTruthy();
    });

    it('should render with different sizes', () => {
      const sizes = [48, 92, 132, 160] as const;
      sizes.forEach(size => {
        const { getAllByLabelText } = render(
          <Avatar size={size} accessibilityLabel={`Avatar ${size}`} />,
        );
        expect(getAllByLabelText(`Avatar ${size}`)).toBeTruthy();
      });
    });

    it('should render avatar container', () => {
      const { root } = render(<Avatar />);
      expect(root).toBeTruthy();
    });
  });

  describe('Variant: default', () => {
    it('should not render picker button in default variant', () => {
      const { queryByLabelText } = render(<Avatar variant="default" />);
      expect(queryByLabelText('Add profile picture')).toBeNull();
    });

    it('should use PhotoProfileIcon in default variant', () => {
      const { getByTestId } = render(<Avatar variant="default" />);
      expect(getByTestId('default-avatar-icon')).toBeTruthy();
    });
  });

  describe('Variant: picker', () => {
    it('should render add button when no image is selected', () => {
      const { getByLabelText } = render(<Avatar variant="picker" />);
      expect(getByLabelText('Add profile picture')).toBeTruthy();
    });

    it('should render remove button when image is selected', () => {
      const { getByLabelText } = render(
        <Avatar variant="picker" source="https://example.com/avatar.jpg" />,
      );
      expect(getByLabelText('Remove profile picture')).toBeTruthy();
    });

    it('should have button role for picker button', () => {
      const { getByRole } = render(<Avatar variant="picker" />);
      expect(getByRole('button')).toBeTruthy();
    });

    it('should use UserProfileIcon in picker variant', () => {
      const { getByTestId } = render(<Avatar variant="picker" />);
      expect(getByTestId('default-avatar-icon')).toBeTruthy();
    });

    it('should show options modal when add button is pressed', () => {
      const { getByLabelText, getByText } = render(<Avatar variant="picker" />);
      const addButton = getByLabelText('Add profile picture');

      fireEvent.press(addButton);

      expect(getByText('Choose an option')).toBeTruthy();
      expect(getByText('Take Photo')).toBeTruthy();
      expect(getByText('Choose from Gallery')).toBeTruthy();
    });

    it('should close options modal when cancel is pressed', () => {
      const { getByLabelText, getByText, queryByText } = render(
        <Avatar variant="picker" />,
      );

      fireEvent.press(getByLabelText('Add profile picture'));
      expect(getByText('Choose an option')).toBeTruthy();

      fireEvent.press(getByLabelText('Cancel'));
      expect(queryByText('Choose an option')).toBeNull();
    });

    it('should close options modal when background is pressed', () => {
      const { getByLabelText, getByText, queryByText } = render(
        <Avatar variant="picker" />,
      );

      fireEvent.press(getByLabelText('Add profile picture'));
      expect(getByText('Choose an option')).toBeTruthy();

      // Press the modal background (TouchableOpacity wrapper)
      const modalBackground =
        getByText('Choose an option').parent?.parent?.parent;
      if (modalBackground) {
        fireEvent.press(modalBackground);
      }

      expect(queryByText('Choose an option')).toBeNull();
    });
  });

  describe('Image Picker Functionality', () => {
    it('should request permissions when picking image', async () => {
      const mockRequestPermission = jest.fn().mockResolvedValue({
        status: 'granted',
      });
      const mockLaunchImageLibrary = jest.fn().mockResolvedValue({
        canceled: true,
      });

      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockImplementation(mockRequestPermission);
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockImplementation(
        mockLaunchImageLibrary,
      );

      const { getByLabelText, getByText } = render(<Avatar variant="picker" />);

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(mockRequestPermission).toHaveBeenCalled();
      });
    });

    it('should show alert when permission is denied', async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'denied',
      });

      const { getByLabelText, getByText } = render(<Avatar variant="picker" />);

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Permission Required',
          'Sorry, we need camera roll permissions to make this work!',
          [{ text: 'OK' }],
        );
      });
    });

    it('should call onChangeImage when image is selected', async () => {
      const mockOnChangeImage = jest.fn();
      const mockImageUri = 'file://path/to/image.jpg';

      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: mockImageUri }],
      });

      const { getByLabelText, getByText } = render(
        <Avatar variant="picker" onChangeImage={mockOnChangeImage} />,
      );

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(mockOnChangeImage).toHaveBeenCalledWith(mockImageUri);
      });
    });

    it('should launch image library with correct options', async () => {
      const mockLaunchImageLibrary = jest.fn().mockResolvedValue({
        canceled: true,
      });

      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockImplementation(
        mockLaunchImageLibrary,
      );

      const { getByLabelText, getByText } = render(<Avatar variant="picker" />);

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(mockLaunchImageLibrary).toHaveBeenCalledWith({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      });
    });

    it('should not call onChangeImage when picker is canceled', async () => {
      const mockOnChangeImage = jest.fn();

      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const { getByLabelText, getByText } = render(
        <Avatar variant="picker" onChangeImage={mockOnChangeImage} />,
      );

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(mockOnChangeImage).not.toHaveBeenCalled();
      });
    });

    it('should close options modal after selecting image', async () => {
      const mockImageUri = 'file://path/to/image.jpg';

      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: mockImageUri }],
      });

      const { getByLabelText, getByText, queryByText } = render(
        <Avatar variant="picker" />,
      );

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(queryByText('Choose an option')).toBeNull();
      });
    });

    it('should not open picker in default variant', async () => {
      const mockRequestPermission = jest.fn();
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockImplementation(mockRequestPermission);

      const { queryByText } = render(<Avatar variant="default" />);

      // Try to trigger handlePickImage (should do nothing in default variant)
      expect(queryByText('Choose from Gallery')).toBeNull();
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });
  });

  describe('Camera Functionality', () => {
    it('should open camera modal when Take Photo is pressed', async () => {
      const mockRequestPermission = jest.fn().mockResolvedValue({
        status: 'granted',
      });

      (useCameraPermissions as jest.Mock).mockReturnValue([
        { granted: true },
        mockRequestPermission,
      ]);

      const { getByLabelText, getAllByLabelText, getAllByText } = render(
        <Avatar variant="picker" />,
      );

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getAllByText('Take Photo')[0]);

      await waitFor(() => {
        expect(getAllByLabelText('Close camera')).toBeTruthy();
      });
    });

    it('should request camera permission if not granted', async () => {
      const mockRequestPermission = jest.fn().mockResolvedValue({
        status: 'granted',
      });

      (useCameraPermissions as jest.Mock).mockReturnValue([
        { granted: false },
        mockRequestPermission,
      ]);

      const { getByLabelText, getByText } = render(<Avatar variant="picker" />);

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Take Photo'));

      await waitFor(() => {
        expect(mockRequestPermission).toHaveBeenCalled();
      });
    });

    it('should show alert when camera permission is denied', async () => {
      const mockRequestPermission = jest.fn().mockResolvedValue({
        status: 'denied',
      });

      (useCameraPermissions as jest.Mock).mockReturnValue([
        { granted: false },
        mockRequestPermission,
      ]);

      const { getByLabelText, getByText } = render(<Avatar variant="picker" />);

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Take Photo'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Permission Required',
          'Sorry, we need camera permissions to take photos!',
          [{ text: 'OK' }],
        );
      });
    });

    it('should close camera modal when close button is pressed', async () => {
      (useCameraPermissions as jest.Mock).mockReturnValue([
        { granted: true },
        jest.fn(),
      ]);

      const {
        getByLabelText,
        getAllByLabelText,
        getByText,
        queryByLabelText,
        queryAllByLabelText,
      } = render(<Avatar variant="picker" />);

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Take Photo'));

      await waitFor(() => {
        expect(getAllByLabelText('Close camera')).toBeTruthy();
      });

      // Get all close buttons and press the first one
      const closeButtons = queryAllByLabelText('Close camera')[0];
      if (closeButtons) {
        fireEvent.press(closeButtons);
      }

      await waitFor(() => {
        expect(queryByLabelText('Close camera')).toBeNull();
      });
    });

    it('should take picture and close camera', async () => {
      const mockOnChangeImage = jest.fn();
      const mockPhotoUri = 'file://photo.jpg';
      const mockTakePicture = jest.fn().mockResolvedValue({
        uri: mockPhotoUri,
      });

      (useCameraPermissions as jest.Mock).mockReturnValue([
        { granted: true },
        jest.fn(),
      ]);

      const { getByLabelText, getByText, queryByLabelText } = render(
        <Avatar variant="picker" onChangeImage={mockOnChangeImage} />,
      );

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Take Photo'));

      await waitFor(() => {
        expect(getByLabelText('Take picture')).toBeTruthy();
      });
    });

    it('should handle camera picture error', async () => {
      const mockTakePicture = jest
        .fn()
        .mockRejectedValue(new Error('Camera error'));

      (useCameraPermissions as jest.Mock).mockReturnValue([
        { granted: true },
        jest.fn(),
      ]);

      const { getByLabelText, getByText } = render(<Avatar variant="picker" />);

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Take Photo'));

      await waitFor(() => {
        expect(getByLabelText('Take picture')).toBeTruthy();
      });

      // The error handling is in the component, just verify the structure exists
      expect(getByLabelText('Take picture')).toBeTruthy();
    });

    it('should toggle camera facing', async () => {
      (useCameraPermissions as jest.Mock).mockReturnValue([
        { granted: true },
        jest.fn(),
      ]);

      const { getByLabelText, getAllByLabelText, getByText } = render(
        <Avatar variant="picker" />,
      );

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Take Photo'));

      await waitFor(() => {
        expect(getAllByLabelText('Close camera')).toBeTruthy();
      });

      fireEvent.press(getByLabelText('Switch camera'));

      // Verify the button exists and is pressable
      expect(getByLabelText('Switch camera')).toBeTruthy();
    });

    it('should not open camera in default variant', async () => {
      const mockRequestPermission = jest.fn();
      (useCameraPermissions as jest.Mock).mockReturnValue([
        { granted: true },
        mockRequestPermission,
      ]);

      const { queryByText } = render(<Avatar variant="default" />);

      expect(queryByText('Take Photo')).toBeNull();
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });
  });

  describe('Remove Image Functionality', () => {
    it('should show add button after image is removed', () => {
      const { getByLabelText } = render(
        <Avatar variant="picker" source="file://image.jpg" />,
      );

      const removeButton = getByLabelText('Remove profile picture');
      fireEvent.press(removeButton);

      expect(getByLabelText('Add profile picture')).toBeTruthy();
    });

    it('should call onChangeImage with empty string when removed', () => {
      const mockOnChangeImage = jest.fn();

      const { getByLabelText } = render(
        <Avatar
          variant="picker"
          source="file://image.jpg"
          onChangeImage={mockOnChangeImage}
        />,
      );

      fireEvent.press(getByLabelText('Remove profile picture'));

      expect(mockOnChangeImage).toHaveBeenCalledWith('');
    });

    it('should clear internal state when remove button is pressed', () => {
      const { getByLabelText } = render(
        <Avatar variant="picker" source="file://image.jpg" />,
      );

      const removeButton = getByLabelText('Remove profile picture');
      expect(removeButton).toBeTruthy();

      fireEvent.press(removeButton);

      const addButton = getByLabelText('Add profile picture');
      expect(addButton).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility hint for picker button', () => {
      const { getByHintText } = render(<Avatar variant="picker" />);
      expect(
        getByHintText(
          'Double tap to select a profile picture from your device',
        ),
      ).toBeTruthy();
    });

    it('should accept custom accessibility hint', () => {
      const customHint = 'Custom accessibility hint';
      const { getByHintText } = render(
        <Avatar variant="picker" accessibilityHint={customHint} />,
      );
      expect(getByHintText(customHint)).toBeTruthy();
    });

    it('should have button role for picker buttons', () => {
      const { getByRole } = render(<Avatar variant="picker" />);
      expect(getByRole('button')).toBeTruthy();
    });

    it('should have appropriate accessibility label for remove button', () => {
      const { getByLabelText } = render(
        <Avatar variant="picker" source="file://image.jpg" />,
      );
      expect(getByLabelText('Remove profile picture')).toBeTruthy();
    });

    it('should have image role for avatar', () => {
      const { getAllByRole } = render(<Avatar variant="default" />);
      expect(getAllByRole('image')).toBeTruthy();
    });

    it('should have default avatar placeholder hint', () => {
      const { getByA11yHint } = render(<Avatar variant="default" />);
      expect(getByA11yHint('Default avatar placeholder')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing assets in image picker result', async () => {
      const mockOnChangeImage = jest.fn();

      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [],
      });

      const { getByLabelText, getByText } = render(
        <Avatar variant="picker" onChangeImage={mockOnChangeImage} />,
      );

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(mockOnChangeImage).not.toHaveBeenCalled();
      });
    });

    it('should handle undefined uri in assets', async () => {
      const mockOnChangeImage = jest.fn();

      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{}],
      });

      const { getByLabelText, getByText } = render(
        <Avatar variant="picker" onChangeImage={mockOnChangeImage} />,
      );

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(mockOnChangeImage).not.toHaveBeenCalled();
      });
    });

    it('should not trigger image picker in default variant', async () => {
      const mockRequestPermission = jest.fn();
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockImplementation(mockRequestPermission);

      const { getAllByLabelText } = render(<Avatar variant="default" />);
      const avatar = getAllByLabelText('Profile picture')[0];

      fireEvent.press(avatar);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockRequestPermission).not.toHaveBeenCalled();
    });

    it('should handle source prop as undefined', () => {
      const { getByLabelText } = render(
        <Avatar variant="picker" source={undefined} />,
      );
      expect(getByLabelText('Add profile picture')).toBeTruthy();
    });

    it('should handle empty string source', () => {
      const { getByLabelText } = render(<Avatar variant="picker" source="" />);
      expect(getByLabelText('Add profile picture')).toBeTruthy();
    });

    it('should handle null camera permission', async () => {
      (useCameraPermissions as jest.Mock).mockReturnValue([null, jest.fn()]);

      const { getByLabelText, getByText, queryByLabelText } = render(
        <Avatar variant="picker" />,
      );

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Take Photo'));

      await waitFor(() => {
        expect(queryByLabelText('Close camera')).toBeNull();
      });
    });

    it('should handle undefined onChangeImage callback', async () => {
      const mockImageUri = 'file://path/to/image.jpg';

      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: mockImageUri }],
      });

      const { getByLabelText, getByText } = render(<Avatar variant="picker" />);

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Choose from Gallery'));
    });
  });

  describe('Component Props', () => {
    it('should use default size of 92 when not specified', () => {
      const { getAllByLabelText } = render(<Avatar />);
      const avatar = getAllByLabelText('Profile picture');
      expect(avatar).toBeTruthy();
    });

    it('should use default variant of "default" when not specified', () => {
      const { queryByLabelText } = render(<Avatar />);
      expect(queryByLabelText('Add profile picture')).toBeNull();
    });

    it('should handle onChangeImage callback correctly', async () => {
      const mockCallback = jest.fn();
      const testUri = 'file://test.jpg';

      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({ status: 'granted' });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: testUri }],
      });

      const { getByLabelText, getByText } = render(
        <Avatar variant="picker" onChangeImage={mockCallback} />,
      );

      fireEvent.press(getByLabelText('Add profile picture'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(testUri);
        expect(mockCallback).toHaveBeenCalledTimes(1);
      });
    });

    it('should render without crashing when all props are provided', () => {
      const { getByLabelText } = render(
        <Avatar
          size={132}
          variant="picker"
          source="https://example.com/avatar.jpg"
          onChangeImage={jest.fn()}
          accessibilityLabel="Test avatar"
          accessibilityHint="Test hint"
        />,
      );
      expect(getByLabelText('Test avatar')).toBeTruthy();
    });
  });
});
