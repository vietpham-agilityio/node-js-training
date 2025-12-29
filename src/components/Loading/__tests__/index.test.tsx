import { render } from '@testing-library/react-native';

// Components
import { Loading } from '..';

// Mock the loading store
const mockUseLoadingStore = jest.fn();
jest.mock('@/stores/loading', () => ({
  useLoadingStore: () => mockUseLoadingStore(),
}));

// Mock Typo component
jest.mock('@/components/Typo', () => ({
  Typo: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

describe('Loading Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('When not loading', () => {
    it('should return null when isLoading is false', () => {
      mockUseLoadingStore.mockReturnValue({
        isLoading: false,
        message: null,
      });

      const { queryByRole } = render(<Loading />);
      expect(queryByRole('progressbar')).toBeNull();
    });

    it('should return null when isLoading is false even with message prop', () => {
      mockUseLoadingStore.mockReturnValue({
        isLoading: false,
        message: 'Store message',
      });

      const { queryByRole } = render(<Loading message="Prop message" />);
      expect(queryByRole('progressbar')).toBeNull();
    });
  });

  describe('Component structure', () => {
    it('should render Typo component when message exists', () => {
      mockUseLoadingStore.mockReturnValue({
        isLoading: true,
        message: null,
      });

      const { getByText } = render(<Loading message="Test message" />);
      expect(getByText('Test message')).toBeTruthy();
    });

    it('should not render Typo component when no message', () => {
      mockUseLoadingStore.mockReturnValue({
        isLoading: true,
        message: null,
      });

      const { queryByText } = render(<Loading />);
      // Should not find any text content
      expect(queryByText(/./)).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined message prop', () => {
      mockUseLoadingStore.mockReturnValue({
        isLoading: true,
        message: 'Store message',
      });

      const { getByText } = render(<Loading message={undefined} />);
      expect(getByText('Store message')).toBeTruthy();
    });
  });
});
