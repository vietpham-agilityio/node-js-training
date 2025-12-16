import { fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
  reverseGeocodeAsync,
} from 'expo-location';

// Component
import { LocationDropdown } from '../';

// Constants
import { ERROR_MESSAGES } from '@/constants';

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));

// Mock uniwind
jest.mock('uniwind', () => ({
  useResolveClassNames: (classNames: string) => ({ className: classNames }),
  withUniwind: (Component: typeof Text) => Component,
}));

describe('LocationDropdown Component', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    testID: 'location-dropdown',
    onChange: mockOnChange,
  };

  const mockLocation = {
    coords: {
      latitude: -6.2088,
      longitude: 106.8456,
    },
  };

  const mockAddress = [
    {
      city: 'Jakarta',
      street: 'Test Street',
      region: 'Jakarta',
      country: 'Indonesia',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);
    (reverseGeocodeAsync as jest.Mock).mockResolvedValue(mockAddress);
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<LocationDropdown {...defaultProps} />);
      expect(getByTestId('location-dropdown')).toBeTruthy();
    });

    it('should display placeholder text initially', () => {
      const { getByText } = render(<LocationDropdown {...defaultProps} />);
      expect(getByText('Select Your Location')).toBeTruthy();
    });

    it('should render the dropdown button', () => {
      const { getByTestId } = render(<LocationDropdown {...defaultProps} />);
      expect(getByTestId('location-dropdown-button')).toBeTruthy();
    });

    it('should not show error message initially', () => {
      const { queryByTestId } = render(<LocationDropdown {...defaultProps} />);
      expect(queryByTestId('location-dropdown-error')).toBeNull();
    });

    it('should not show modal initially', () => {
      const { queryByTestId } = render(<LocationDropdown {...defaultProps} />);
      expect(queryByTestId('location-dropdown-modal')).toBeNull();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <LocationDropdown {...defaultProps} testID="custom-dropdown" />,
      );
      expect(getByTestId('custom-dropdown')).toBeTruthy();
    });

    it('should apply containerClassName', () => {
      const { getByTestId } = render(
        <LocationDropdown
          {...defaultProps}
          containerClassName="custom-class"
        />,
      );
      const container = getByTestId('location-dropdown');
      expect(container).toBeTruthy();
    });
  });

  describe('Placeholder Display', () => {
    it('should show placeholder when value is empty', () => {
      const { getByText } = render(
        <LocationDropdown {...defaultProps} value="" />,
      );
      expect(getByText('Select Your Location')).toBeTruthy();
    });

    it('should show placeholder when value is not provided', () => {
      const { getByText } = render(<LocationDropdown {...defaultProps} />);
      expect(getByText('Select Your Location')).toBeTruthy();
    });

    it('should show placeholder when value is whitespace only', () => {
      const { getByText } = render(
        <LocationDropdown {...defaultProps} value="   " />,
      );
      expect(getByText('Select Your Location')).toBeTruthy();
    });
  });

  describe('Opening Dropdown', () => {
    it('should request location permission when opened', async () => {
      const { getByTestId } = render(<LocationDropdown {...defaultProps} />);
      const button = getByTestId('location-dropdown-button');

      fireEvent.press(button);

      await waitFor(() => {
        expect(requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
      });
    });

    it('should get current position after permission granted', async () => {
      const { getByTestId } = render(<LocationDropdown {...defaultProps} />);
      const button = getByTestId('location-dropdown-button');

      fireEvent.press(button);

      await waitFor(() => {
        expect(getCurrentPositionAsync).toHaveBeenCalledTimes(1);
      });
    });

    it('should reverse geocode after getting position', async () => {
      const { getByTestId } = render(<LocationDropdown {...defaultProps} />);
      const button = getByTestId('location-dropdown-button');

      fireEvent.press(button);

      await waitFor(() => {
        expect(reverseGeocodeAsync).toHaveBeenCalledWith({
          latitude: mockLocation.coords.latitude,
          longitude: mockLocation.coords.longitude,
        });
      });
    });

    it('should open modal after successful location fetch', async () => {
      const { getByTestId } = render(<LocationDropdown {...defaultProps} />);
      const button = getByTestId('location-dropdown-button');

      fireEvent.press(button);

      await waitFor(() => {
        expect(getByTestId('location-dropdown-modal')).toBeTruthy();
      });
    });

    it('should not open modal if permission is denied', async () => {
      (requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { getByTestId, queryByTestId } = render(
        <LocationDropdown {...defaultProps} />,
      );
      const button = getByTestId('location-dropdown-button');

      fireEvent.press(button);

      await waitFor(() => {
        expect(queryByTestId('location-dropdown-modal')).toBeNull();
      });
    });

    it('should show error message when permission is denied', async () => {
      (requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { getByTestId, getByText } = render(
        <LocationDropdown {...defaultProps} />,
      );
      const button = getByTestId('location-dropdown-button');

      fireEvent.press(button);

      await waitFor(() => {
        expect(
          getByText(ERROR_MESSAGES.LOCATION_PERMISSION_DENIED),
        ).toBeTruthy();
      });
    });

    it('should not request location if disabled', async () => {
      const { getByTestId } = render(
        <LocationDropdown {...defaultProps} disabled={true} />,
      );
      const button = getByTestId('location-dropdown-button');

      fireEvent.press(button);

      await waitFor(() => {
        expect(requestForegroundPermissionsAsync).not.toHaveBeenCalled();
      });
    });
  });

  describe('Location Selection', () => {
    it('should display selected location after selection', async () => {
      const { getByTestId, getByText } = render(
        <LocationDropdown {...defaultProps} />,
      );
      const button = getByTestId('location-dropdown-button');

      // Open dropdown and fetch location
      fireEvent.press(button);

      await waitFor(() => {
        expect(getByTestId('location-dropdown-modal')).toBeTruthy();
      });

      // Select location
      const option = getByTestId('location-dropdown-option-Jakarta');
      fireEvent.press(option);

      // Check that onChange was called
      expect(mockOnChange).toHaveBeenCalledWith('Jakarta');

      // Check that modal is closed
      await waitFor(() => {
        expect(() => getByTestId('location-dropdown-modal')).toThrow();
      });
    });

    it('should display selected location value when provided', async () => {
      // First, set up location data
      const { getByTestId, rerender, getByText } = render(
        <LocationDropdown {...defaultProps} />,
      );
      const button = getByTestId('location-dropdown-button');

      fireEvent.press(button);

      await waitFor(() => {
        expect(getByTestId('location-dropdown-modal')).toBeTruthy();
      });

      const option = getByTestId('location-dropdown-option-Jakarta');
      fireEvent.press(option);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Jakarta');
      });

      // Rerender with value prop
      rerender(<LocationDropdown {...defaultProps} value="Jakarta" />);

      expect(getByText('Jakarta')).toBeTruthy();
    });

    it('should close modal after selection', async () => {
      const { getByTestId, queryByTestId } = render(
        <LocationDropdown {...defaultProps} />,
      );
      const button = getByTestId('location-dropdown-button');

      fireEvent.press(button);

      await waitFor(() => {
        expect(getByTestId('location-dropdown-modal')).toBeTruthy();
      });

      const option = getByTestId('location-dropdown-option-Jakarta');
      fireEvent.press(option);

      await waitFor(() => {
        expect(queryByTestId('location-dropdown-modal')).toBeNull();
      });
    });
  });
});
