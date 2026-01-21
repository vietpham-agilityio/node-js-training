import { BookingStatus } from '@/features/booking/schemas/booking';

// Constants
import { BOOKING_STATUS } from './status';

export const ERROR_MESSAGES = {
  INVALID_TICKET: 'Invalid ticket',
  TICKET_ALREADY_USED: 'Ticket already used',
  TICKET_EXPIRED: 'Ticket expired',
  TICKET_INVALID_FORMAT: 'Invalid QR code format',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  FULL_NAME_REQUIRED: 'Full name is required',
  FULL_NAME_MIN_LENGTH: (length: number) =>
    `Full name must be at least ${length} characters`,
  FULL_NAME_MAX_LENGTH: (length: number) =>
    `Full name must not exceed ${length} characters`,
  PASSWORD_MIN_LENGTH: (length: number) =>
    `Password must be at least ${length} characters`,
  PASSWORD_UPPERCASE: 'Password must contain at least one uppercase letter',
  PASSWORD_LOWERCASE: 'Password must contain at least one lowercase letter',
  PASSWORD_SPECIAL_CHAR: 'Password must contain at least one special character',
  CONFIRM_PASSWORD_REQUIRED: 'Please confirm your password',
  PASSWORD_NOT_MATCH: 'Passwords do not match',
  TAKE_PICTURE_ERROR: 'Failed to take picture. Please try again.',
  LOGIN_FAILED: 'Login failed. Please try again.',
  INVALID_EMAIL_PASSWORD: 'Invalid email or password. Please try again.',
  GOOGLE_SIGN_IN_FAILED: 'Google Sign In Failed',
  FACEBOOK_SIGN_IN_FAILED: 'Facebook Sign In Failed',
  SIGNUP_FAILED: 'Sign Up Failed',
  CREATE_ACCOUNT_FAILED: 'Failed to create account',
  SIGN_OUT_FAILED: 'Failed to sign out',
  CONFIRM_ACCOUNT_FAILED: 'Failed to confirm account',
  MOVIE_NETWORK_ERROR:
    'We’re having trouble loading movies. Please try again later.',
  TICKET_NETWORK_ERROR:
    'We’re having trouble loading tickets. Please try again later.',
  LOCATION_PERMISSION_DENIED: 'Permission to access location was denied',
  INVALID_PHONE_NUMBER: 'Invalid phone number format',
  UPDATE_FAILED: 'Update failed',
  UPDATE_PROFILE_FAILED: 'Failed to update profile',
  CHECKOUT_FAILED: 'Failed to create your booking',
  TOP_UP_FAILED: 'Failed to top up wallet. Please try again.',
  TOP_UP_MIN_AMOUNT: 'Minimum top-up amount is IDR 10.000',
  TOP_UP_MAX_AMOUNT: 'Maximum top-up amount is IDR 10.000.000',
  UPDATE_PASSWORD_FAILED: 'Failed to update password. Please try again.',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again later.',
  TICKET_VALIDATION_FAILED: 'Failed to validate ticket. Please try again.',
};

export const MESSAGES = {
  NO_SHOWTIMES_AVAILABLE_TITLE: 'No showtimes available',
  NO_SHOWTIMES_AVAILABLE_DESCRIPTION: 'Please select a different date',
  TICKET_VALIDATED_SUCCESS: 'Ticket validated successfully',
  PERMISSION_REQUIRED: 'Permission Required',
  CAMERA_ROLL_PERMISSION_REQUIRED:
    'Sorry, we need camera roll permissions to make this work!',
  CAMERA_PERMISSION_REQUIRED:
    'Sorry, we need camera permissions to take photos!',
  SIGNUP_SUCCESS: 'Sign up successful',
  SIGNIN_SUCCESS: 'Successfully signed in!',
  ACCOUNT_VERIFICATION_SUCCESS:
    'Account created successfully! Please check your email to verify your account.',
  SIGN_OUT: 'Sign Out',
  SIGN_OUT_MESSAGE: 'Are you sure you want to sign out?',
  CONFIRM_SUCCESS: 'Confirm account successful',
  CONFIRM_SUCCESS_MESSAGE: 'Your account is ready! Welcome aboard.',
  NO_RESULT_FOUND: 'No results found. Please try a different search.',
  NO_TICKETS: 'Start your movie journey by booking a ticket',
  NO_ACTIVE_TICKETS: 'Book a movie to see your active tickets here',
  NO_EXPIRED_TICKETS: 'Your expired and used tickets will appear here',
  UPDATE_SUCCESS: 'Update successful',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
  CHECKOUT_SUCCESS_TITLE: 'Happy Watching!',
  CHECKOUT_SUCCESS_DESCRIPTION: 'You have successfully bought the ticket.',
  PURCHASE_SUCCESS_TITLE: 'Yummy!',
  PURCHASE_SUCCESS_DESCRIPTION: 'You have successfully top up the wallet.',
  PASSWORD_UPDATE_SUCCESS: 'Your password has been changed successfully',
};

export const UNACTIVE_MESSAGE: Record<string, string> = {
  [BOOKING_STATUS.ACTIVE as BookingStatus]: '',
  [BOOKING_STATUS.EXPIRED as BookingStatus]:
    'This ticket has expired and can no longer be used.',
  [BOOKING_STATUS.USED as BookingStatus]:
    'This ticket has already been scanned and used.',
  [BOOKING_STATUS.CANCELLED as BookingStatus]:
    'This booking has been cancelled.',
};
