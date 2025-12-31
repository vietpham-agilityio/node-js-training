import { fireEvent, render } from '@testing-library/react-native';
import { OptionsModal } from '../';

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
