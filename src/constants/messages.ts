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
};

export const MESSAGES = {
  TICKET_VALIDATED_SUCCESS: 'Ticket validated successfully',
  PERMISSION_REQUIRED: 'Permission Required',
  CAMERA_ROLL_PERMISSION_REQUIRED:
    'Sorry, we need camera roll permissions to make this work!',
  CAMERA_PERMISSION_REQUIRED:
    'Sorry, we need camera permissions to take photos!',
  SIGNUP_SUCCESS: 'Sign up successful',
  ACCOUNT_VERIFICATION_SUCCESS:
    'Account created successfully! Please check your email to verify your account.',
  SIGN_OUT: 'Sign Out',
  SIGN_OUT_MESSAGE: 'Are you sure you want to sign out?',
  CONFIRM_SUCCESS: 'Confirm account successful',
  CONFIRM_SUCCESS_MESSAGE: 'Your account is ready! Welcome aboard.',
};
