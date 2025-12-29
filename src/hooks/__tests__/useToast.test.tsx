import { ToastType } from '@/constants';
import { useToastStore } from '@/stores/toast';
import { act, renderHook } from '@testing-library/react-native';
import { ToastAlert, useToastAlert } from '../useToast';

jest.mock('@/stores/toast', () => ({
  useToastStore: jest.fn(),
}));

describe('useToastAlert', () => {
  const mockShow = jest.fn();
  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();
  const mockShowWarning = jest.fn();
  const mockShowInfo = jest.fn();
  const mockShowWithAction = jest.fn();
  const mockHideAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useToastStore as unknown as jest.Mock).mockReturnValue({
      show: mockShow,
      showSuccess: mockShowSuccess,
      showError: mockShowError,
      showWarning: mockShowWarning,
      showInfo: mockShowInfo,
      showWithAction: mockShowWithAction,
      hideAll: mockHideAll,
    });

    // Mock getState for ToastAlert static methods
    (useToastStore as any).getState = jest.fn(() => ({
      show: mockShow,
      showSuccess: mockShowSuccess,
      showError: mockShowError,
      showWarning: mockShowWarning,
      showInfo: mockShowInfo,
      showWithAction: mockShowWithAction,
      hideAll: mockHideAll,
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('useToastAlert hook', () => {
    it('provides success method', () => {
      const { result } = renderHook(() => useToastAlert());

      act(() => {
        result.current.success('Success message');
      });

      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Success message',
        undefined,
      );
    });

    it('provides success method with custom duration', () => {
      const { result } = renderHook(() => useToastAlert());

      act(() => {
        result.current.success('Success message', 5000);
      });

      expect(mockShowSuccess).toHaveBeenCalledWith('Success message', 5000);
    });

    it('provides error method', () => {
      const { result } = renderHook(() => useToastAlert());

      act(() => {
        result.current.error('Error message');
      });

      expect(mockShowError).toHaveBeenCalledWith('Error message', undefined);
    });

    it('provides error method with custom duration', () => {
      const { result } = renderHook(() => useToastAlert());

      act(() => {
        result.current.error('Error message', 4000);
      });

      expect(mockShowError).toHaveBeenCalledWith('Error message', 4000);
    });

    it('provides warning method', () => {
      const { result } = renderHook(() => useToastAlert());

      act(() => {
        result.current.warning('Warning message');
      });

      expect(mockShowWarning).toHaveBeenCalledWith(
        'Warning message',
        undefined,
      );
    });

    it('provides warning method with custom duration', () => {
      const { result } = renderHook(() => useToastAlert());

      act(() => {
        result.current.warning('Warning message', 3500);
      });

      expect(mockShowWarning).toHaveBeenCalledWith('Warning message', 3500);
    });

    it('provides info method', () => {
      const { result } = renderHook(() => useToastAlert());

      act(() => {
        result.current.info('Info message');
      });

      expect(mockShowInfo).toHaveBeenCalledWith('Info message', undefined);
    });

    it('provides info method with custom duration', () => {
      const { result } = renderHook(() => useToastAlert());

      act(() => {
        result.current.info('Info message', 3000);
      });

      expect(mockShowInfo).toHaveBeenCalledWith('Info message', 3000);
    });

    it('provides withAction method', () => {
      const { result } = renderHook(() => useToastAlert());
      const mockAction = { label: 'Undo', onPress: jest.fn() };

      act(() => {
        result.current.withAction('Action message', mockAction);
      });

      expect(mockShowWithAction).toHaveBeenCalledWith(
        'Action message',
        ToastType.INFO,
        mockAction,
        undefined,
      );
    });

    it('provides withAction method with custom type and duration', () => {
      const { result } = renderHook(() => useToastAlert());
      const mockAction = { label: 'Retry', onPress: jest.fn() };

      act(() => {
        result.current.withAction(
          'Action message',
          mockAction,
          ToastType.ERROR,
          6000,
        );
      });

      expect(mockShowWithAction).toHaveBeenCalledWith(
        'Action message',
        ToastType.ERROR,
        mockAction,
        6000,
      );
    });

    it('provides alert method', () => {
      const { result } = renderHook(() => useToastAlert());

      act(() => {
        result.current.alert('Alert title', 'Alert message');
      });

      expect(mockShowInfo).toHaveBeenCalled();
    });

    it('provides hideAll method', () => {
      const { result } = renderHook(() => useToastAlert());

      act(() => {
        result.current.hideAll();
      });

      expect(mockHideAll).toHaveBeenCalled();
    });
  });

  describe('ToastAlert.alert - Basic Usage', () => {
    it('shows info toast with only title', () => {
      ToastAlert.alert('Test title');

      expect(mockShowInfo).toHaveBeenCalledWith('Test title');
    });

    it('combines title and message', () => {
      ToastAlert.alert('Title', 'Message');

      expect(mockShowInfo).toHaveBeenCalledWith('Title\nMessage');
    });

    it('shows toast with empty string message', () => {
      ToastAlert.alert('Title', '');

      expect(mockShowInfo).toHaveBeenCalledWith('Title');
    });
  });

  describe('ToastAlert.alert - Type Detection', () => {
    it('uses type from options when provided', () => {
      ToastAlert.alert('Error occurred', 'Details', [], {
        type: ToastType.ERROR,
      });

      expect(mockShowError).toHaveBeenCalledWith('Error occurred\nDetails');
    });

    it('uses SUCCESS type from options', () => {
      ToastAlert.alert('Success!', 'Operation completed', [], {
        type: ToastType.SUCCESS,
      });

      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Success!\nOperation completed',
      );
    });

    it('uses WARNING type from options', () => {
      ToastAlert.alert('Warning', 'Please be careful', [], {
        type: ToastType.WARNING,
      });

      expect(mockShowWarning).toHaveBeenCalledWith(
        'Warning\nPlease be careful',
      );
    });

    it('uses INFO type from options', () => {
      ToastAlert.alert('Information', 'Just so you know', [], {
        type: ToastType.INFO,
      });

      expect(mockShowInfo).toHaveBeenCalledWith(
        'Information\nJust so you know',
      );
    });

    it('shows error type for destructive buttons', () => {
      ToastAlert.alert('Delete item', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive' },
      ]);

      expect(mockShowError).toHaveBeenCalled();
    });

    it('shows info type for default buttons', () => {
      ToastAlert.alert('Confirm action', 'Are you sure?', [
        { text: 'OK', style: 'default' },
      ]);

      expect(mockShowInfo).toHaveBeenCalled();
    });

    it('shows info type when no buttons provided', () => {
      ToastAlert.alert('Message');

      expect(mockShowInfo).toHaveBeenCalled();
    });

    it('shows info type for cancel buttons only', () => {
      ToastAlert.alert('Cancelled', 'Operation cancelled', [
        { text: 'OK', style: 'cancel' },
      ]);

      expect(mockShowInfo).toHaveBeenCalled();
    });

    it('prioritizes destructive style even with multiple buttons', () => {
      ToastAlert.alert('Confirm', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', style: 'default' },
        { text: 'Delete', style: 'destructive' },
      ]);

      expect(mockShowError).toHaveBeenCalled();
    });
  });

  describe('ToastAlert.alert - Action Buttons', () => {
    it('shows toast with action button', () => {
      const onPress = jest.fn();

      ToastAlert.alert('Confirm action', 'Are you sure?', [
        { text: 'OK', onPress },
      ]);

      expect(mockShowWithAction).toHaveBeenCalledWith(
        'Confirm action\nAre you sure?',
        ToastType.INFO,
        { label: 'OK', onPress },
        5000,
      );
    });

    it('shows toast with custom action label', () => {
      const onPress = jest.fn();

      ToastAlert.alert('Title', 'Message', [
        { text: 'Custom Action', onPress },
      ]);

      expect(mockShowWithAction).toHaveBeenCalledWith(
        'Title\nMessage',
        ToastType.INFO,
        { label: 'Custom Action', onPress },
        5000,
      );
    });

    it('defaults to OK label if no text provided', () => {
      const onPress = jest.fn();

      ToastAlert.alert('Title', undefined, [{ onPress }]);

      expect(mockShowWithAction).toHaveBeenCalledWith(
        'Title',
        ToastType.INFO,
        { label: 'OK', onPress },
        5000,
      );
    });

    it('uses first non-cancel button with onPress as action', () => {
      const action1 = jest.fn();
      const action2 = jest.fn();

      ToastAlert.alert('Title', 'Message', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Action 1', onPress: action1 },
        { text: 'Action 2', onPress: action2 },
      ]);

      expect(mockShowWithAction).toHaveBeenCalledWith(
        'Title\nMessage',
        ToastType.INFO,
        { label: 'Action 1', onPress: action1 },
        5000,
      );
    });

    it('shows simple toast when no action button (only cancel)', () => {
      ToastAlert.alert('Simple message', undefined, [
        { text: 'Cancel', style: 'cancel' },
      ]);

      expect(mockShowInfo).toHaveBeenCalledWith('Simple message');
      expect(mockShowWithAction).not.toHaveBeenCalled();
    });

    it('shows simple toast when button has no onPress', () => {
      ToastAlert.alert('Title', 'Message', [
        { text: 'OK' }, // No onPress
      ]);

      expect(mockShowInfo).toHaveBeenCalledWith('Title\nMessage');
      expect(mockShowWithAction).not.toHaveBeenCalled();
    });

    it('ignores cancel buttons when finding action button', () => {
      const onPress = jest.fn();

      ToastAlert.alert('Title', 'Message', [
        { text: 'Cancel', style: 'cancel', onPress: jest.fn() },
        { text: 'OK', onPress },
      ]);

      expect(mockShowWithAction).toHaveBeenCalledWith(
        'Title\nMessage',
        ToastType.INFO,
        { label: 'OK', onPress },
        5000,
      );
    });
  });

  describe('ToastAlert.alert - Button onPress Callback', () => {
    it('calls button onPress after delay', () => {
      const onPress = jest.fn();

      ToastAlert.alert('Title', 'Message', [
        { text: 'OK', onPress, style: 'default' },
      ]);

      expect(onPress).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(onPress).toHaveBeenCalled();
    });

    it('calls first non-cancel button onPress', () => {
      const cancelPress = jest.fn();
      const okPress = jest.fn();

      ToastAlert.alert('Title', 'Message', [
        { text: 'Cancel', onPress: cancelPress, style: 'cancel' },
        { text: 'OK', onPress: okPress, style: 'default' },
      ]);

      jest.advanceTimersByTime(100);

      expect(cancelPress).not.toHaveBeenCalled();
      expect(okPress).toHaveBeenCalled();
    });

    it('does not call onPress when no buttons provided', () => {
      ToastAlert.alert('Title', 'Message');

      jest.advanceTimersByTime(100);

      // Should not crash
      expect(mockShowInfo).toHaveBeenCalled();
    });

    it('does not call onPress when all buttons are cancel', () => {
      const onPress = jest.fn();

      ToastAlert.alert('Title', 'Message', [
        { text: 'Cancel', onPress, style: 'cancel' },
      ]);

      jest.advanceTimersByTime(100);

      expect(onPress).not.toHaveBeenCalled();
    });

    it('does not call onPress when button has no onPress function', () => {
      ToastAlert.alert('Title', 'Message', [{ text: 'OK', style: 'default' }]);

      jest.advanceTimersByTime(100);

      // Should not crash
      expect(mockShowInfo).toHaveBeenCalled();
    });

    it('calls onPress for button without explicit style', () => {
      const onPress = jest.fn();

      ToastAlert.alert('Title', 'Message', [
        { text: 'OK', onPress }, // No style - treated as default
      ]);

      jest.advanceTimersByTime(100);

      expect(onPress).toHaveBeenCalled();
    });
  });

  describe('ToastAlert.alert - Toast Type Switch', () => {
    it('calls showSuccess for SUCCESS type', () => {
      ToastAlert.alert('Success', undefined, undefined, {
        type: ToastType.SUCCESS,
      });

      expect(mockShowSuccess).toHaveBeenCalledWith('Success');
    });

    it('calls showError for ERROR type', () => {
      ToastAlert.alert('Error', undefined, undefined, {
        type: ToastType.ERROR,
      });

      expect(mockShowError).toHaveBeenCalledWith('Error');
    });

    it('calls showWarning for WARNING type', () => {
      ToastAlert.alert('Warning', undefined, undefined, {
        type: ToastType.WARNING,
      });

      expect(mockShowWarning).toHaveBeenCalledWith('Warning');
    });

    it('calls showInfo for INFO type', () => {
      ToastAlert.alert('Info', undefined, undefined, {
        type: ToastType.INFO,
      });

      expect(mockShowInfo).toHaveBeenCalledWith('Info');
    });

    it('calls show for unknown type', () => {
      const unknownType = 'UNKNOWN' as ToastType;

      ToastAlert.alert('Message', undefined, undefined, {
        type: unknownType,
      });

      expect(mockShow).toHaveBeenCalledWith('Message', unknownType);
    });
  });

  describe('ToastAlert.alert - Edge Cases', () => {
    it('handles empty buttons array', () => {
      ToastAlert.alert('Title', 'Message', []);

      expect(mockShowInfo).toHaveBeenCalledWith('Title\nMessage');
    });

    it('handles undefined options', () => {
      ToastAlert.alert('Title', 'Message', [], undefined);

      expect(mockShowInfo).toHaveBeenCalledWith('Title\nMessage');
    });

    it('handles button with empty string text', () => {
      const onPress = jest.fn();

      ToastAlert.alert('Title', 'Message', [{ text: '', onPress }]);

      expect(mockShowWithAction).toHaveBeenCalledWith(
        'Title\nMessage',
        ToastType.INFO,
        { label: 'OK', onPress },
        5000,
      );
    });

    it('preserves action button even with showWithAction', () => {
      const onPress = jest.fn();

      ToastAlert.alert('Title', 'Message', [{ text: 'Action', onPress }]);

      // Should call showWithAction
      expect(mockShowWithAction).toHaveBeenCalled();

      // AND still call button onPress after delay
      jest.advanceTimersByTime(100);
      expect(onPress).toHaveBeenCalled();
    });
  });

  describe('ToastAlert.getTypeFromButtons', () => {
    it('returns INFO when buttons is undefined', () => {
      ToastAlert.alert('Title');

      expect(mockShowInfo).toHaveBeenCalled();
    });

    it('returns ERROR when destructive button exists', () => {
      ToastAlert.alert('Title', undefined, [
        { text: 'Delete', style: 'destructive' },
      ]);

      expect(mockShowError).toHaveBeenCalled();
    });

    it('returns INFO when no destructive button exists', () => {
      ToastAlert.alert('Title', undefined, [{ text: 'OK', style: 'default' }]);

      expect(mockShowInfo).toHaveBeenCalled();
    });

    it('returns INFO when buttons array is empty', () => {
      ToastAlert.alert('Title', undefined, []);

      expect(mockShowInfo).toHaveBeenCalled();
    });
  });
});
