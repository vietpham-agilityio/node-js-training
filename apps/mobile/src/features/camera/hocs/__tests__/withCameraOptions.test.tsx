import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useCameraPermissions } from 'expo-camera';
import { ImageManipulator } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Text, TouchableOpacity, View } from 'react-native';
import {
  CameraOptionInjectedProps,
  withCameraOption,
} from '../withCameraOptions';

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

// Test component
function TestComponent({
  openCameraOptions,
  isSelectingImage,
}: CameraOptionInjectedProps) {
  return (
    <View>
      <TouchableOpacity testID="open-button" onPress={openCameraOptions}>
        <Text>Open Options</Text>
      </TouchableOpacity>
      <Text testID="selecting-state">
        {isSelectingImage ? 'selecting' : 'idle'}
      </Text>
    </View>
  );
}

const EnhancedComponent = withCameraOption(TestComponent);

describe('withCameraOption HOC', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock camera permissions
    (useCameraPermissions as jest.Mock).mockReturnValue([
      { granted: true },
      jest.fn(),
    ]);
  });

  describe('Initial State', () => {
    it('renders wrapped component', () => {
      const { getByTestId } = render(<EnhancedComponent />);

      expect(getByTestId('open-button')).toBeTruthy();
      expect(getByTestId('selecting-state').props.children).toBe('idle');
    });

    it('does not show modals initially', () => {
      const { queryByText } = render(<EnhancedComponent />);

      expect(queryByText('Choose an option')).toBeNull();
      expect(queryByText('Take Photo')).toBeNull();
    });
  });

  describe('openCameraOptions', () => {
    it('opens options modal when called', () => {
      const { getByTestId, getByText } = render(<EnhancedComponent />);

      fireEvent.press(getByTestId('open-button'));

      expect(getByText('Choose an option')).toBeTruthy();
    });
  });

  describe('Camera Selection', () => {
    it('requests camera permission when not granted', async () => {
      const mockRequestPermission = jest.fn().mockResolvedValue({
        status: 'granted',
      });

      (useCameraPermissions as jest.Mock).mockReturnValue([
        { granted: false },
        mockRequestPermission,
      ]);

      const { getByTestId, getByText } = render(<EnhancedComponent />);

      fireEvent.press(getByTestId('open-button'));
      fireEvent.press(getByText('Take Photo'));

      await waitFor(() => {
        expect(mockRequestPermission).toHaveBeenCalled();
      });
    });

    it('opens camera modal when permission granted', async () => {
      (useCameraPermissions as jest.Mock).mockReturnValue([
        { granted: true },
        jest.fn(),
      ]);

      const { getByTestId, getByText, getByLabelText } = render(
        <EnhancedComponent />,
      );

      fireEvent.press(getByTestId('open-button'));

      await waitFor(() => {
        fireEvent.press(getByText('Take Photo'));
      });

      await waitFor(() => {
        expect(getByLabelText('Camera')).toBeTruthy();
      });
    });
  });

  describe('Image Compression', () => {
    it('uses default maxImageSize and imageQuality', async () => {
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

      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({ status: 'granted' });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://original.jpg' }],
      });

      const { getByTestId, getByText } = render(<EnhancedComponent />);

      fireEvent.press(getByTestId('open-button'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(mockManipulate.resize).toHaveBeenCalledWith({ width: 800 });
      });
    });

    it('uses custom maxImageSize and imageQuality', async () => {
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

      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({ status: 'granted' });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://original.jpg' }],
      });

      const { getByTestId, getByText } = render(
        <EnhancedComponent maxImageSize={1024} imageQuality={0.9} />,
      );

      fireEvent.press(getByTestId('open-button'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(mockManipulate.resize).toHaveBeenCalledWith({ width: 1024 });
      });
    });

    it('returns original URI if compression fails', async () => {
      const mockCallback = jest.fn();

      (ImageManipulator.manipulate as jest.Mock).mockImplementation(() => {
        throw new Error('Compression failed');
      });

      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({ status: 'granted' });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://original.jpg' }],
      });

      const { getByTestId, getByText } = render(
        <EnhancedComponent onImageSelected={mockCallback} />,
      );

      fireEvent.press(getByTestId('open-button'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith('file://original.jpg');
      });
    });
  });

  describe('isSelectingImage state', () => {
    it('is true while processing image', async () => {
      (
        ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
      ).mockResolvedValue({ status: 'granted' });

      let resolveImagePicker: any;
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockReturnValue(
        new Promise(resolve => {
          resolveImagePicker = resolve;
        }),
      );

      const { getByTestId, getByText } = render(<EnhancedComponent />);

      fireEvent.press(getByTestId('open-button'));
      fireEvent.press(getByText('Choose from Gallery'));

      await waitFor(() => {
        expect(getByTestId('selecting-state').props.children).toBe('selecting');
      });

      // Resolve
      act(() => {
        resolveImagePicker({
          canceled: false,
          assets: [{ uri: 'file://image.jpg' }],
        });
      });

      await waitFor(() => {
        expect(getByTestId('selecting-state').props.children).toBe('idle');
      });
    });
  });

  describe('Props forwarding', () => {
    it('forwards other props to wrapped component', () => {
      function TestComponentWithProps({
        customProp,
      }: CameraOptionInjectedProps & { customProp: string }) {
        return (
          <View>
            <Text testID="custom-prop">{customProp}</Text>
          </View>
        );
      }

      const Enhanced = withCameraOption(TestComponentWithProps);
      const { getByTestId } = render(<Enhanced customProp="test-value" />);

      expect(getByTestId('custom-prop').props.children).toBe('test-value');
    });
  });
});
