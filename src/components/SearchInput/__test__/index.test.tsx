import { fireEvent, render } from '@testing-library/react-native';

// Component
import { SearchInput } from '../';

describe('SearchInput Component', () => {
  const defaultProps = {
    testID: 'test-search-input',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<SearchInput {...defaultProps} />);
      expect(getByTestId('test-search-input')).toBeTruthy();
    });

    it('should render the search input field', () => {
      const { getByTestId } = render(<SearchInput {...defaultProps} />);
      expect(getByTestId('test-search-input-input')).toBeTruthy();
    });

    it('should render with default placeholder', () => {
      const { getByPlaceholderText } = render(
        <SearchInput {...defaultProps} />,
      );
      expect(getByPlaceholderText('Search movies')).toBeTruthy();
    });

    it('should render with custom placeholder', () => {
      const { getByPlaceholderText } = render(
        <SearchInput {...defaultProps} placeholder="Search for movies" />,
      );
      expect(getByPlaceholderText('Search for movies')).toBeTruthy();
    });

    it('should render with initial value', () => {
      const { getByDisplayValue } = render(
        <SearchInput {...defaultProps} value="Inception" />,
      );
      expect(getByDisplayValue('Inception')).toBeTruthy();
    });

    it('should render with empty string value', () => {
      const { getByTestId } = render(
        <SearchInput {...defaultProps} value="" />,
      );
      const input = getByTestId('test-search-input-input');
      expect(input.props.value).toBe('');
    });

    it('should render with default empty value when value prop is not provided', () => {
      const { getByTestId } = render(<SearchInput {...defaultProps} />);
      const input = getByTestId('test-search-input-input');
      expect(input.props.value).toBe('');
    });
  });

  describe('Search Icon', () => {
    it('should render search icon', () => {
      const { getByLabelText } = render(<SearchInput {...defaultProps} />);
      expect(getByLabelText('Search')).toBeTruthy();
    });
  });

  describe('Text Input', () => {
    it('should handle text changes', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <SearchInput {...defaultProps} onChangeText={onChangeText} />,
      );
      const input = getByTestId('test-search-input-input');
      fireEvent.changeText(input, 'The Matrix');
      expect(onChangeText).toHaveBeenCalledWith('The Matrix');
    });

    it('should call onChangeText with correct value', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <SearchInput {...defaultProps} onChangeText={onChangeText} />,
      );
      const input = getByTestId('test-search-input-input');
      fireEvent.changeText(input, 'Interstellar');
      expect(onChangeText).toHaveBeenCalledWith('Interstellar');
      expect(onChangeText).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple text changes', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <SearchInput {...defaultProps} onChangeText={onChangeText} />,
      );
      const input = getByTestId('test-search-input-input');
      fireEvent.changeText(input, 'a');
      fireEvent.changeText(input, 'ab');
      fireEvent.changeText(input, 'abc');
      expect(onChangeText).toHaveBeenCalledTimes(3);
      expect(onChangeText).toHaveBeenLastCalledWith('abc');
    });
  });
});
