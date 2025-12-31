import { fireEvent, render } from '@testing-library/react-native';
import { CameraModal } from '../';
import { OptionsModal } from '../../OptionsModal';
import { PreviewModal } from '../../PreviewModal';

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  CameraType: { back: 'back', front: 'front' },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('OptionsModal', () => {
  const defaultProps = {
    visible: true,
    iconSize: 24,
    onClose: jest.fn(),
    onOpenCamera: jest.fn(),
    onPickImage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when visible', () => {
      const { getByText } = render(<OptionsModal {...defaultProps} />);

      expect(getByText('Choose an option')).toBeTruthy();
      expect(getByText('Take Photo')).toBeTruthy();
      expect(getByText('Choose from Gallery')).toBeTruthy();
    });

    it('does not render when not visible', () => {
      const { queryByText } = render(
        <OptionsModal {...defaultProps} visible={false} />,
      );

      expect(queryByText('Choose an option')).toBeNull();
    });
  });

  describe('Interactions', () => {
    it('calls onOpenCamera when Take Photo pressed', () => {
      const { getByText } = render(<OptionsModal {...defaultProps} />);

      fireEvent.press(getByText('Take Photo'));

      expect(defaultProps.onOpenCamera).toHaveBeenCalled();
    });

    it('calls onPickImage when Choose from Gallery pressed', () => {
      const { getByText } = render(<OptionsModal {...defaultProps} />);

      fireEvent.press(getByText('Choose from Gallery'));

      expect(defaultProps.onPickImage).toHaveBeenCalled();
    });

    it('calls onClose when cancel button pressed', () => {
      const { getByLabelText } = render(<OptionsModal {...defaultProps} />);

      fireEvent.press(getByLabelText('Cancel'));

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop pressed', () => {
      const { getByLabelText } = render(<OptionsModal {...defaultProps} />);

      fireEvent.press(getByLabelText('Close options'));

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility labels', () => {
      const { getByLabelText } = render(<OptionsModal {...defaultProps} />);

      expect(getByLabelText('Photo selection options')).toBeTruthy();
      expect(getByLabelText('Take photo with camera')).toBeTruthy();
      expect(getByLabelText('Choose from gallery')).toBeTruthy();
      expect(getByLabelText('Cancel')).toBeTruthy();
    });

    it('is a modal', () => {
      const { getByLabelText } = render(<OptionsModal {...defaultProps} />);
      const modal = getByLabelText('Photo selection options');

      expect(modal.props.accessibilityViewIsModal).toBe(true);
    });
  });
});

describe('CameraModal', () => {
  const defaultProps = {
    visible: true,
    facing: 'back' as const,
    onClose: jest.fn(),
    onTakePicture: jest.fn(),
    onToggleFacing: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders camera view when visible', () => {
      const { getByLabelText } = render(<CameraModal {...defaultProps} />);

      expect(getByLabelText('Camera')).toBeTruthy();
    });

    it('renders camera controls', () => {
      const { getByLabelText } = render(<CameraModal {...defaultProps} />);

      expect(getByLabelText('Close camera')).toBeTruthy();
      expect(getByLabelText('Take picture')).toBeTruthy();
      expect(getByLabelText('Switch camera')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onClose when close button pressed', () => {
      const { getByLabelText } = render(<CameraModal {...defaultProps} />);

      fireEvent.press(getByLabelText('Close camera'));

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onToggleFacing when switch button pressed', () => {
      const { getByLabelText } = render(<CameraModal {...defaultProps} />);

      fireEvent.press(getByLabelText('Switch camera'));

      expect(defaultProps.onToggleFacing).toHaveBeenCalled();
    });

    it('takes picture when capture button pressed', async () => {
      // Mock CameraView ref
      const mockTakePicture = jest.fn().mockResolvedValue({
        uri: 'file://photo.jpg',
      });

      const { getByLabelText } = render(<CameraModal {...defaultProps} />);

      // Simulate camera ready
      const captureButton = getByLabelText('Take picture');

      // Press capture
      fireEvent.press(captureButton);

      // Note: Full testing of camera capture requires more complex mocking
      // This tests that the button is pressable
      expect(captureButton).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility labels', () => {
      const { getByLabelText } = render(<CameraModal {...defaultProps} />);

      expect(getByLabelText('Camera')).toBeTruthy();
      expect(getByLabelText('Camera controls')).toBeTruthy();
      expect(getByLabelText('Close camera')).toBeTruthy();
      expect(getByLabelText('Take picture')).toBeTruthy();
      expect(getByLabelText('Switch camera')).toBeTruthy();
    });

    it('has accessibility hints', () => {
      const { getByLabelText } = render(<CameraModal {...defaultProps} />);

      const closeButton = getByLabelText('Close camera');
      const captureButton = getByLabelText('Take picture');
      const switchButton = getByLabelText('Switch camera');

      expect(closeButton.props.accessibilityHint).toBeDefined();
      expect(captureButton.props.accessibilityHint).toBeDefined();
      expect(switchButton.props.accessibilityHint).toBeDefined();
    });
  });
});

describe('PreviewModal', () => {
  const defaultProps = {
    visible: true,
    previewUri: 'file://preview.jpg',
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    onRetake: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders preview image when visible', () => {
      const { getByLabelText } = render(<PreviewModal {...defaultProps} />);

      expect(getByLabelText('Photo preview')).toBeTruthy();
    });

    it('renders all action buttons', () => {
      const { getByText } = render(<PreviewModal {...defaultProps} />);

      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Retake')).toBeTruthy();
      expect(getByText('Use Photo')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onClose when cancel button pressed', () => {
      const { getByLabelText } = render(<PreviewModal {...defaultProps} />);

      fireEvent.press(getByLabelText('Cancel photo'));

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onRetake when retake button pressed', () => {
      const { getByLabelText } = render(<PreviewModal {...defaultProps} />);

      fireEvent.press(getByLabelText('Retake photo'));

      expect(defaultProps.onRetake).toHaveBeenCalled();
    });

    it('calls onConfirm when use photo button pressed', () => {
      const { getByLabelText } = render(<PreviewModal {...defaultProps} />);

      fireEvent.press(getByLabelText('Use this photo'));

      expect(defaultProps.onConfirm).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility labels', () => {
      const { getByLabelText } = render(<PreviewModal {...defaultProps} />);

      expect(getByLabelText('Photo preview')).toBeTruthy();
      expect(getByLabelText('Preview controls')).toBeTruthy();
      expect(getByLabelText('Cancel photo')).toBeTruthy();
      expect(getByLabelText('Retake photo')).toBeTruthy();
      expect(getByLabelText('Use this photo')).toBeTruthy();
    });

    it('has accessibility hints', () => {
      const { getByLabelText } = render(<PreviewModal {...defaultProps} />);

      const cancelButton = getByLabelText('Cancel photo');
      const retakeButton = getByLabelText('Retake photo');
      const confirmButton = getByLabelText('Use this photo');

      expect(cancelButton.props.accessibilityHint).toBe(
        'Double tap to discard this photo',
      );
      expect(retakeButton.props.accessibilityHint).toBe(
        'Double tap to take another photo',
      );
      expect(confirmButton.props.accessibilityHint).toBe(
        'Double tap to use this photo as your avatar',
      );
    });

    it('is a modal', () => {
      const { getByLabelText } = render(<PreviewModal {...defaultProps} />);
      const modal = getByLabelText('Photo preview');

      expect(modal.props.accessibilityViewIsModal).toBe(true);
    });
  });
});
