import { act } from '@testing-library/react-native';
import { useHeaderStore } from '../header';

describe('useHeaderStore', () => {
  // Reset the store to its initial state before each test
  beforeEach(() => {
    act(() => {
      useHeaderStore.setState({ title: null });
    });
  });

  it('should return the initial state', () => {
    const { title } = useHeaderStore.getState();
    expect(title).toBeNull();
  });

  it('should set the title correctly', () => {
    const newTitle = 'Test Title';
    act(() => {
      useHeaderStore.getState().setTitle(newTitle);
    });
    const { title } = useHeaderStore.getState();
    expect(title).toBe(newTitle);
  });

  it('should clear the title correctly', () => {
    // First, set a title
    act(() => {
      useHeaderStore.getState().setTitle('Some Title');
    });
    expect(useHeaderStore.getState().title).toBe('Some Title');

    // Then, clear it
    act(() => {
      useHeaderStore.getState().clearTitle();
    });
    const { title } = useHeaderStore.getState();
    expect(title).toBeNull();
  });
});
