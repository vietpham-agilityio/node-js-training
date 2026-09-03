import { fireEvent, render } from '@testing-library/react-native';
import { PreviewModal } from '..';

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
