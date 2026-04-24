import { STATUS_CODE } from "./status-code.ts";

export const ERROR_MESSAGE_WITH_STATUS_CODE: Record<number, string> = {
  [STATUS_CODE.OK]: 'OK',
  [STATUS_CODE.CREATED]: 'Created',
  [STATUS_CODE.BAD_REQUEST]: 'Bad Request',
  [STATUS_CODE.UNAUTHORIZED]: 'Unauthorized',
  [STATUS_CODE.FORBIDDEN]: 'Forbidden',
  [STATUS_CODE.NOT_FOUND]: 'Not Found',
  [STATUS_CODE.CONFLICT]: 'Conflict',
  [STATUS_CODE.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
}

export const ERROR_CODE_WITH_STATUS_CODE: Record<number, string> = {
  [STATUS_CODE.OK]: 'OK',
  [STATUS_CODE.CREATED]: 'CREATED',
  [STATUS_CODE.BAD_REQUEST]: 'BAD_REQUEST',
  [STATUS_CODE.UNAUTHORIZED]: 'UNAUTHORIZED',
  [STATUS_CODE.FORBIDDEN]: 'FORBIDDEN',
  [STATUS_CODE.NOT_FOUND]: 'NOT_FOUND',
  [STATUS_CODE.CONFLICT]: 'CONFLICT',
  [STATUS_CODE.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
}

export const USER_ERROR = {
  USER_NOT_FOUND: 'User not found',
  USER_INVALID_EMAIL: 'Email is required and must be non-empty',
  USER_INVALID_PASSWORD: 'Password is required',
  USER_ID_NOT_FOUND: 'User ID not found',
  FAILED_TO_CREATE_USER: 'Failed to create user',
  FAILED_TO_GET_ALL_USERS: 'Failed to get all users',
  FAILED_TO_UPDATE_USER: 'Failed to update user',
  USER_ALREADY_ADMIN: 'User already has the admin role.',
}

export const COURSE_ERROR = {
  COURSE_NOT_FOUND: 'Course not found',
  FAILED_TO_CREATE_COURSE: 'Failed to create course',
  FAILED_TO_GET_ALL_COURSES: 'Failed to get courses',
  FAILED_TO_UPDATE_COURSE: 'Failed to update course',
  COURSE_DELETED: 'Course deleted successfully.',
  COURSE_INVALID_ID: 'Course id must be a positive integer.',
}

export const PAYMENT_ERROR = {
  CHECKOUT_FAILED: 'Could not create checkout session.',
  CHECKOUT_AMOUNT_TOO_LOW:
    'Amount is below the minimum allowed for this currency.',
  CHECKOUT_STRIPE_NOT_CONFIGURED: 'Stripe is not configured on the server.',
}

export const AUTH_ERROR = {
  AUTH_TOKEN_REQUIRED:
    'Authentication required. Please send request with valid token.',
  ADMIN_REQUIRED: 'Admin role required to perform this action.',
}
