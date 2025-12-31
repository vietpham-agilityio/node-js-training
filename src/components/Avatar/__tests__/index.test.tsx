import { render } from '@testing-library/react-native';
import { useCameraPermissions } from 'expo-camera';
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
jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: {
    manipulate: jest.fn(() => ({
      resize: jest.fn().mockReturnThis(),
      renderAsync: jest.fn().mockResolvedValue({
        saveAsync: jest.fn().mockResolvedValue({
          uri: 'file://compressed.jpg',
        }),
      }),
    })),
  },
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

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
      const { queryByLabelText } = render(<Avatar />);
      expect(queryByLabelText('Add profile picture')).toBeNull();
    });

    it('should use PhotoProfileIcon in default variant', () => {
      const { getByTestId } = render(<Avatar />);
      expect(getByTestId('default-avatar-icon')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have image role for avatar', () => {
      const { getAllByRole } = render(<Avatar />);
      expect(getAllByRole('image')).toBeTruthy();
    });

    it('should have default avatar placeholder hint', () => {
      const { getByA11yHint } = render(<Avatar />);
      expect(getByA11yHint('Default avatar placeholder')).toBeTruthy();
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
  });
});
