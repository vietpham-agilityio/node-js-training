import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

// Component
import { Toast } from '../';

// Constants
import { ToastType } from '@/constants';

// Mock the store
const mockUseToastStore = jest.fn();
jest.mock('@/stores/toast', () => ({
  useToastStore: () => mockUseToastStore(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('uniwind', () => ({
  useResolveClassNames: (classNames: string) => ({ className: classNames }),
  withUniwind: (Component: typeof Text) => Component,
}));

describe('Toast Component', () => {
  const mockHide = jest.fn();
  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseToastStore.mockReturnValue({
      toast: null,
      hide: mockHide,
      showSuccess: mockShowSuccess,
      showError: mockShowError,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should return null when no toast is present', () => {
      const { toJSON } = render(<Toast />);
      expect(toJSON()).toBeNull();
    });

    it('should render success toast when toast is present', () => {
      mockUseToastStore.mockReturnValue({
        toast: {
          message: 'Success message',
          type: ToastType.SUCCESS,
        },
        hide: mockHide,
      });

      const { getByText } = render(<Toast />);
      expect(getByText('Success message')).toBeTruthy();
    });

    it('should render error toast when toast is present', () => {
      mockUseToastStore.mockReturnValue({
        toast: {
          message: 'Error message',
          type: ToastType.ERROR,
        },
        hide: mockHide,
      });

      const { getByText } = render(<Toast />);
      expect(getByText('Error message')).toBeTruthy();
    });

    it('should render matching snapshot for success toast', () => {
      mockUseToastStore.mockReturnValue({
        toast: {
          message: 'Success message',
          type: ToastType.SUCCESS,
        },
        hide: mockHide,
      });

      const { toJSON } = render(<Toast />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render matching snapshot for error toast', () => {
      mockUseToastStore.mockReturnValue({
        toast: {
          message: 'Error message',
          type: ToastType.ERROR,
        },
        hide: mockHide,
      });

      const { toJSON } = render(<Toast />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Toast Types', () => {
    it('should apply success styling for success toast', () => {
      mockUseToastStore.mockReturnValue({
        toast: {
          message: 'Success!',
          type: ToastType.SUCCESS,
        },
        hide: mockHide,
      });

      const { getByText } = render(<Toast />);
      const toastContainer = getByText('Success!').parent?.parent;
      expect(toastContainer).toBeTruthy();
    });

    it('should apply error styling for error toast', () => {
      mockUseToastStore.mockReturnValue({
        toast: {
          message: 'Error!',
          type: ToastType.ERROR,
        },
        hide: mockHide,
      });

      const { getByText } = render(<Toast />);
      const toastContainer = getByText('Error!').parent?.parent;
      expect(toastContainer).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call hide when toast is pressed', () => {
      mockUseToastStore.mockReturnValue({
        toast: {
          message: 'Test message',
          type: ToastType.SUCCESS,
        },
        hide: mockHide,
      });

      const { getByLabelText } = render(<Toast />);
      const touchable = getByLabelText('success toast: Test message');

      fireEvent.press(touchable);
      // Wait for animation to complete
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(mockHide).toHaveBeenCalledTimes(1);
    });

    it('should have correct accessibility label', () => {
      mockUseToastStore.mockReturnValue({
        toast: {
          message: 'Test message',
          type: ToastType.SUCCESS,
        },
        hide: mockHide,
      });

      const { getByLabelText } = render(<Toast />);
      expect(getByLabelText('success toast: Test message')).toBeTruthy();
    });

    it('should have correct accessibility label for error', () => {
      mockUseToastStore.mockReturnValue({
        toast: {
          message: 'Error occurred',
          type: ToastType.ERROR,
        },
        hide: mockHide,
      });

      const { getByLabelText } = render(<Toast />);
      expect(getByLabelText('error toast: Error occurred')).toBeTruthy();
    });
  });

  describe('Auto Dismiss', () => {
    it('should auto dismiss after TOAST_DURATION', async () => {
      mockUseToastStore.mockReturnValue({
        toast: {
          message: 'Auto dismiss test',
          type: ToastType.SUCCESS,
        },
        hide: mockHide,
      });

      render(<Toast />);

      // Fast-forward time to trigger auto dismiss
      act(() => {
        jest.advanceTimersByTime(3000); // TOAST_DURATION
      });

      // Wait for animation to complete
      act(() => {
        jest.advanceTimersByTime(200); // Animation duration
      });

      await waitFor(() => {
        expect(mockHide).toHaveBeenCalledTimes(1);
      });
    });

    it('should clear timer when component unmounts', () => {
      mockUseToastStore.mockReturnValue({
        toast: {
          message: 'Test',
          type: ToastType.SUCCESS,
        },
        hide: mockHide,
      });

      const { unmount } = render(<Toast />);
      unmount();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // hide should not be called after unmount
      expect(mockHide).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      mockUseToastStore.mockReturnValue({
        toast: {
          message: '',
          type: ToastType.SUCCESS,
        },
        hide: mockHide,
      });

      const { getByLabelText } = render(<Toast />);
      expect(getByLabelText('success toast: ')).toBeTruthy();
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(200);
      mockUseToastStore.mockReturnValue({
        toast: {
          message: longMessage,
          type: ToastType.ERROR,
        },
        hide: mockHide,
      });

      const { getByText } = render(<Toast />);
      expect(getByText(longMessage)).toBeTruthy();
    });
  });
});
