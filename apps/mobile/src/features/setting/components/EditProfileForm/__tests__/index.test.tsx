import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TextInput } from 'react-native';

// Component
import { EditProfileForm } from '../';

// Types
import { UserProfile } from '@/features/auth/types/auth';

// Mock dependencies
const mockOnSubmit = jest.fn();

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('EditProfileForm Component', () => {
  const mockUserInfo: UserProfile = {
    id: 'user-123',
    fullName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+1234567890',
    address: '123 Main St',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const defaultProps = {
    userInfo: mockUserInfo,
    isPending: false,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      expect(getByTestId('signup-fullname-input')).toBeTruthy();
    });

    it('should render full name input field', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      expect(getByTestId('signup-fullname-input')).toBeTruthy();
    });

    it('should render email input field', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      expect(getByTestId('signup-email-input')).toBeTruthy();
    });

    it('should render address input field', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      expect(getByTestId('edit-address-input')).toBeTruthy();
    });

    it('should render phone number input field', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      expect(getByTestId('edit-phone-number-input')).toBeTruthy();
    });

    it('should render submit button', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      expect(getByTestId('update-my-profile-submit-button')).toBeTruthy();
    });

    it('should display correct labels', () => {
      const { getByText } = render(<EditProfileForm {...defaultProps} />);
      expect(getByText('Full Name')).toBeTruthy();
      expect(getByText('Email Address')).toBeTruthy();
      expect(getByText('Address')).toBeTruthy();
      expect(getByText('Phone Number')).toBeTruthy();
    });

    it('should display submit button with correct text', () => {
      const { getByText } = render(<EditProfileForm {...defaultProps} />);
      expect(getByText('Update My Profile')).toBeTruthy();
    });

    it('should display default values from userInfo', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);

      const fullNameInput = getByTestId('signup-fullname-input-input');
      const emailInput = getByTestId('signup-email-input-input');
      const addressInput = getByTestId('edit-address-input-input');
      const phoneNumberInput = getByTestId('edit-phone-number-input-input');

      expect(fullNameInput.props.value).toBe('John Doe');
      expect(emailInput.props.value).toBe('john@example.com');
      expect(addressInput.props.value).toBe('123 Main St');
      expect(phoneNumberInput.props.value).toBe('+1234567890');
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in full name input', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      const fullNameInput = getByTestId('signup-fullname-input-input');

      fireEvent.changeText(fullNameInput, 'Jane Smith');
      expect(fullNameInput.props.value).toBe('Jane Smith');
    });

    it('should allow typing in email input', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      const emailInput = getByTestId('signup-email-input-input');

      fireEvent.changeText(emailInput, 'jane@example.com');
      expect(emailInput.props.value).toBe('jane@example.com');
    });

    it('should allow typing in address input', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      const addressInput = getByTestId('edit-address-input-input');

      fireEvent.changeText(addressInput, '456 Oak Ave');
      expect(addressInput.props.value).toBe('456 Oak Ave');
    });

    it('should allow typing in phone number input', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      const phoneNumberInput = getByTestId('edit-phone-number-input-input');

      fireEvent.changeText(phoneNumberInput, '+9876543210');
      expect(phoneNumberInput.props.value).toBe('+9876543210');
    });

    it('should focus email input when full name input submits', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      const fullNameInput = getByTestId('signup-fullname-input-input');

      const focusSpy = jest.spyOn(TextInput.prototype, 'focus');

      fireEvent(fullNameInput, 'submitEditing');

      expect(focusSpy).toHaveBeenCalledTimes(1);

      focusSpy.mockRestore();
    });

    it('should focus address input when email input submits', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      const emailInput = getByTestId('signup-email-input-input');

      const focusSpy = jest.spyOn(TextInput.prototype, 'focus');

      fireEvent(emailInput, 'submitEditing');

      expect(focusSpy).toHaveBeenCalledTimes(1);

      focusSpy.mockRestore();
    });

    it('should focus phone number input when address input submits', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      const addressInput = getByTestId('edit-address-input-input');

      const focusSpy = jest.spyOn(TextInput.prototype, 'focus');

      fireEvent(addressInput, 'submitEditing');

      expect(focusSpy).toHaveBeenCalledTimes(1);

      focusSpy.mockRestore();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error when full name is empty', async () => {
      const { getByTestId, queryByTestId } = render(
        <EditProfileForm {...defaultProps} />,
      );
      const fullNameInput = getByTestId('signup-fullname-input-input');

      fireEvent.changeText(fullNameInput, '');
      fireEvent(fullNameInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('signup-fullname-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should show validation error when full name is too short', async () => {
      const { getByTestId, queryByTestId } = render(
        <EditProfileForm {...defaultProps} />,
      );
      const fullNameInput = getByTestId('signup-fullname-input-input');

      fireEvent.changeText(fullNameInput, 'A');
      fireEvent(fullNameInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('signup-fullname-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should show validation error when email is invalid', async () => {
      const { getByTestId, queryByTestId } = render(
        <EditProfileForm {...defaultProps} />,
      );
      const emailInput = getByTestId('signup-email-input-input');

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent(emailInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('signup-email-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should show validation error when email is empty', async () => {
      const { getByTestId, queryByTestId } = render(
        <EditProfileForm {...defaultProps} />,
      );
      const emailInput = getByTestId('signup-email-input-input');

      fireEvent.changeText(emailInput, '');
      fireEvent(emailInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('signup-email-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should show validation error for invalid phone number format', async () => {
      const { getByTestId, queryByTestId } = render(
        <EditProfileForm {...defaultProps} />,
      );
      const phoneNumberInput = getByTestId('edit-phone-number-input-input');

      fireEvent.changeText(phoneNumberInput, 'invalid-phone');
      fireEvent(phoneNumberInput, 'blur');

      await waitFor(() => {
        const errorMessage = queryByTestId('edit-phone-number-input-error');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should not show error when all fields are valid', async () => {
      const { getByTestId, queryByTestId } = render(
        <EditProfileForm {...defaultProps} />,
      );

      const fullNameInput = getByTestId('signup-fullname-input-input');
      const emailInput = getByTestId('signup-email-input-input');

      fireEvent.changeText(fullNameInput, 'Valid Name');
      fireEvent(fullNameInput, 'blur');

      fireEvent.changeText(emailInput, 'valid@email.com');
      fireEvent(emailInput, 'blur');

      await waitFor(() => {
        expect(queryByTestId('signup-fullname-input-error')).toBeNull();
        expect(queryByTestId('signup-email-input-error')).toBeNull();
      });
    });

    it('should allow empty address field', async () => {
      const { getByTestId, queryByTestId } = render(
        <EditProfileForm {...defaultProps} />,
      );
      const addressInput = getByTestId('edit-address-input-input');

      fireEvent.changeText(addressInput, '');
      fireEvent(addressInput, 'blur');

      await waitFor(() => {
        expect(queryByTestId('edit-address-input-error')).toBeNull();
      });
    });

    it('should allow empty phone number field', async () => {
      const { getByTestId, queryByTestId } = render(
        <EditProfileForm {...defaultProps} />,
      );
      const phoneNumberInput = getByTestId('edit-phone-number-input-input');

      fireEvent.changeText(phoneNumberInput, '');
      fireEvent(phoneNumberInput, 'blur');

      await waitFor(() => {
        expect(queryByTestId('edit-phone-number-input-error')).toBeNull();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with only dirty fields on submit', async () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      const fullNameInput = getByTestId('signup-fullname-input-input');
      const submitButton = getByTestId('update-my-profile-submit-button');

      fireEvent.changeText(fullNameInput, 'New Name');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          fullName: 'New Name',
        });
      });
    });

    it('should include multiple dirty fields in submission', async () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      const fullNameInput = getByTestId('signup-fullname-input-input');
      const addressInput = getByTestId('edit-address-input-input');
      const submitButton = getByTestId('update-my-profile-submit-button');

      fireEvent.changeText(fullNameInput, 'Updated Name');
      fireEvent.changeText(addressInput, 'New Address');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          fullName: 'Updated Name',
          address: 'New Address',
        });
      });
    });

    it('should not call onSubmit when no fields are dirty', async () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      const submitButton = getByTestId('update-my-profile-submit-button');

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should handle phone number update', async () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      const phoneNumberInput = getByTestId('edit-phone-number-input-input');
      const submitButton = getByTestId('update-my-profile-submit-button');

      fireEvent.changeText(phoneNumberInput, '+9876543210');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          phoneNumber: '+9876543210',
        });
      });
    });
  });

  describe('Button State', () => {
    it('should have submit button disabled when form is not dirty', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      const submitButton = getByTestId('update-my-profile-submit-button');

      expect(submitButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should have submit button enabled when form is dirty', async () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      const fullNameInput = getByTestId('signup-fullname-input-input');
      const submitButton = getByTestId('update-my-profile-submit-button');

      fireEvent.changeText(fullNameInput, 'New Name');

      await waitFor(() => {
        expect(submitButton.props.accessibilityState?.disabled).toBe(false);
      });
    });

    it('should have submit button disabled when isPending is true', () => {
      const { getByTestId } = render(
        <EditProfileForm {...defaultProps} isPending={true} />,
      );
      const submitButton = getByTestId('update-my-profile-submit-button');

      expect(submitButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('Empty User Info', () => {
    it('should render with empty userInfo', () => {
      const { getByTestId } = render(
        <EditProfileForm
          userInfo={undefined}
          isPending={false}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(getByTestId('signup-fullname-input')).toBeTruthy();
    });

    it('should handle null address and phoneNumber values', () => {
      const userWithNulls: UserProfile = {
        id: 'user-456',
        fullName: 'Test User',
        email: 'test@example.com',
        address: undefined,
        phoneNumber: undefined,
      };

      const { getByTestId } = render(
        <EditProfileForm
          userInfo={userWithNulls}
          isPending={false}
          onSubmit={mockOnSubmit}
        />,
      );

      const addressInput = getByTestId('edit-address-input-input');
      const phoneNumberInput = getByTestId('edit-phone-number-input-input');

      expect(addressInput.props.value).toBe('');
      expect(phoneNumberInput.props.value).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should render avatar container', () => {
      const { getByTestId } = render(<EditProfileForm {...defaultProps} />);
      expect(getByTestId('avatar-container')).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { toJSON } = render(<EditProfileForm {...defaultProps} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot with empty userInfo', () => {
      const { toJSON } = render(
        <EditProfileForm
          userInfo={undefined}
          isPending={false}
          onSubmit={mockOnSubmit}
        />,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
