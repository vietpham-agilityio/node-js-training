// DDR-006 follow-up: every errorCode a business failure can carry, defined
// once so the client's copy of the list has a single source of truth.
export enum ErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_REGISTERED = 'EMAIL_ALREADY_REGISTERED',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  ADMIN_SELF_ACTION_FORBIDDEN = 'ADMIN_SELF_ACTION_FORBIDDEN',
}
