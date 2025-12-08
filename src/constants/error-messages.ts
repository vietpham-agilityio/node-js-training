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
};

export const MESSAGES = {
  TICKET_VALIDATED_SUCCESS: 'Ticket validated successfully',
};
