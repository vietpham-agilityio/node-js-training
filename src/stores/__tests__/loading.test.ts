import { act } from '@testing-library/react-native';
import { useLoadingStore } from '../loading';

describe('useLoadingStore', () => {
  // Reset the store to its initial state before each test
  beforeEach(() => {
    act(() => {
      useLoadingStore.setState({ isLoading: false, message: null });
    });
  });

  it('should return the initial state', () => {
    const { isLoading, message } = useLoadingStore.getState();
    expect(isLoading).toBe(false);
    expect(message).toBeNull();
  });

  it('should show loading with a message', () => {
    const testMessage = 'Loading data...';
    act(() => {
      useLoadingStore.getState().showLoading(testMessage);
    });
    const { isLoading, message } = useLoadingStore.getState();
    expect(isLoading).toBe(true);
    expect(message).toBe(testMessage);
  });

  it('should show loading without a message', () => {
    act(() => {
      useLoadingStore.getState().showLoading();
    });
    const { isLoading, message } = useLoadingStore.getState();
    expect(isLoading).toBe(true);
    expect(message).toBeNull();
  });

  it('should hide loading', () => {
    // First, show loading
    act(() => {
      useLoadingStore.getState().showLoading('Loading...');
    });
    expect(useLoadingStore.getState().isLoading).toBe(true);

    // Then, hide it
    act(() => {
      useLoadingStore.getState().hideLoading();
    });
    const { isLoading, message } = useLoadingStore.getState();
    expect(isLoading).toBe(false);
    expect(message).toBeNull();
  });
});
