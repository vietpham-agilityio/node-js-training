import { act, renderHook } from '@testing-library/react-native';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      (props: { value: string; delay: number }) =>
        useDebounce(props.value, props.delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      },
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Value should be updated after delay
    expect(result.current).toBe('updated');
  });

  it('should use custom delay', () => {
    const { result, rerender } = renderHook(
      (props: { value: string; delay: number }) =>
        useDebounce(props.value, props.delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      },
    );

    rerender({ value: 'updated', delay: 1000 });

    // Value should not change before delay
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    // Value should change after delay
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('should use default delay of 500ms when not provided', () => {
    const { result, rerender } = renderHook(
      (props: { value: string }) => useDebounce(props.value),
      {
        initialProps: { value: 'initial' },
      },
    );

    rerender({ value: 'updated' });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout when value changes rapidly', () => {
    const { result, rerender } = renderHook(
      (props: { value: string }) => useDebounce(props.value, 500),
      {
        initialProps: { value: 'initial' },
      },
    );

    // Change value multiple times rapidly
    rerender({ value: 'first' });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: 'second' });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: 'third' });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Value should still be initial
    expect(result.current).toBe('initial');

    // After full delay from last change
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should only have the last value
    expect(result.current).toBe('third');
  });

  it('should handle empty string', () => {
    const { result, rerender } = renderHook(
      (props: { value: string }) => useDebounce(props.value, 500),
      {
        initialProps: { value: 'test' },
      },
    );

    rerender({ value: '' });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('');
  });

  it('should handle delay change', () => {
    const { result, rerender } = renderHook(
      (props: { value: string; delay: number }) =>
        useDebounce(props.value, props.delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      },
    );

    rerender({ value: 'updated', delay: 1000 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should not update yet with new delay
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should update after new delay
    expect(result.current).toBe('updated');
  });
});
