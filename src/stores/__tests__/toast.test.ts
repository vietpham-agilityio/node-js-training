import { ToastType } from '@/constants'; // Assuming ToastType is correctly resolved
import { act } from '@testing-library/react-native';
import { useToastStore } from '../toast';

// Mock Date.now and Math.random for deterministic IDs
const MOCK_DATE_NOW = 1678886400000; // A fixed timestamp
const MOCK_MATH_RANDOM = 0.12345; // A fixed random number

describe('useToastStore', () => {
  let dateNowSpy: jest.SpyInstance;
  let mathRandomSpy: jest.SpyInstance;

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(MOCK_DATE_NOW);
    mathRandomSpy = jest
      .spyOn(Math, 'random')
      .mockReturnValue(MOCK_MATH_RANDOM);
  });

  afterAll(() => {
    dateNowSpy.mockRestore();
    mathRandomSpy.mockRestore();
  });

  // Reset the store to its initial state before each test
  beforeEach(() => {
    act(() => {
      useToastStore.setState({ toasts: [] });
    });
  });

  it('should return the initial state', () => {
    const { toasts } = useToastStore.getState();
    expect(toasts).toEqual([]);
  });

  it('should show a default info toast', () => {
    const message = 'Default message';
    act(() => {
      useToastStore.getState().show(message);
    });
    const { toasts } = useToastStore.getState();
    expect(toasts.length).toBe(1);
    expect(toasts[0]).toEqual({
      id: `${MOCK_DATE_NOW}-${MOCK_MATH_RANDOM}`,
      message,
      type: ToastType.INFO,
      duration: 3000,
    });
  });

  it('should show a custom warning toast with custom duration', () => {
    const message = 'Warning message';
    const duration = 5000;
    act(() => {
      useToastStore.getState().show(message, ToastType.WARNING, duration);
    });
    const { toasts } = useToastStore.getState();
    expect(toasts.length).toBe(1);
    expect(toasts[0]).toEqual({
      id: `${MOCK_DATE_NOW}-${MOCK_MATH_RANDOM}`,
      message,
      type: ToastType.WARNING,
      duration,
    });
  });

  it('should show a success toast', () => {
    const message = 'Success!';
    act(() => {
      useToastStore.getState().showSuccess(message);
    });
    const { toasts } = useToastStore.getState();
    expect(toasts.length).toBe(1);
    expect(toasts[0]?.message).toBe(message);
    expect(toasts[0]?.type).toBe(ToastType.SUCCESS);
    expect(toasts[0]?.duration).toBe(3000); // Default duration for success
  });

  it('should show an error toast', () => {
    const message = 'Error!';
    act(() => {
      useToastStore.getState().showError(message);
    });
    const { toasts } = useToastStore.getState();
    expect(toasts.length).toBe(1);
    expect(toasts[0]?.message).toBe(message);
    expect(toasts[0]?.type).toBe(ToastType.ERROR);
    expect(toasts[0]?.duration).toBe(4000); // Default duration for error
  });

  it('should show a warning toast', () => {
    const message = 'Warning!';
    act(() => {
      useToastStore.getState().showWarning(message);
    });
    const { toasts } = useToastStore.getState();
    expect(toasts.length).toBe(1);
    expect(toasts[0]?.message).toBe(message);
    expect(toasts[0]?.type).toBe(ToastType.WARNING);
    expect(toasts[0]?.duration).toBe(3500); // Default duration for warning
  });

  it('should show an info toast', () => {
    const message = 'Info!';
    act(() => {
      useToastStore.getState().showInfo(message);
    });
    const { toasts } = useToastStore.getState();
    expect(toasts.length).toBe(1);
    expect(toasts[0]?.message).toBe(message);
    expect(toasts[0]?.type).toBe(ToastType.INFO);
    expect(toasts[0]?.duration).toBe(3000); // Default duration for info
  });

  it('should show a toast with an action', () => {
    const message = 'Action message';
    const action = { label: 'Undo', onPress: jest.fn() };
    act(() => {
      useToastStore.getState().showWithAction(message, ToastType.INFO, action);
    });
    const { toasts } = useToastStore.getState();
    expect(toasts.length).toBe(1);
    expect(toasts[0]?.message).toBe(message);
    expect(toasts[0]?.action?.label).toBe('Undo');
    expect(toasts[0]?.action?.onPress).toBe(action.onPress);
    expect(toasts[0]?.duration).toBe(5000); // Default duration for action toast
  });

  it('should hide a specific toast', () => {
    const message1 = 'Toast 1';
    const message2 = 'Toast 2';
    let id1: string;

    act(() => {
      useToastStore.getState().show(message1);
      id1 = useToastStore.getState().toasts[0]?.id || '';
    });

    // Ensure Math.random returns a different value for the second toast
    mathRandomSpy.mockReturnValueOnce(0.6789);
    act(() => {
      useToastStore.getState().show(message2);
    });

    expect(useToastStore.getState().toasts.length).toBe(2);

    act(() => {
      useToastStore.getState().hide(id1);
    });

    const { toasts } = useToastStore.getState();
    expect(toasts.length).toBe(1);
    expect(toasts[0]?.message).toBe(message2);
  });

  it('should hide all toasts', () => {
    act(() => {
      useToastStore.getState().show('Toast 1');
    });
    act(() => {
      useToastStore.getState().show('Toast 2');
    });
    expect(useToastStore.getState().toasts.length).toBe(2);

    act(() => {
      useToastStore.getState().hideAll();
    });
    const { toasts } = useToastStore.getState();
    expect(toasts).toEqual([]);
  });
});
