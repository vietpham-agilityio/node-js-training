import { Data } from 'effect';

// Constants
import { ERROR_MESSAGES } from '@/constants/messages';

export class AuthenticationError extends Data.TaggedError(
  'AuthenticationError',
)<{
  message: string;
}> {
  /**
   * Get the underlying cause of the error
   */
  getCause() {
    return this.cause;
  }

  /**
   * Get detailed error information including cause
   */
  getDetails() {
    return {
      message: this.message,
      cause: this.cause,
      tag: this._tag,
    };
  }

  /**
   * Check if the error has a cause
   */
  hasCause(): boolean {
    return this.cause !== undefined;
  }

  static loginFailed = (message: string) => {
    return new AuthenticationError({
      message: message || ERROR_MESSAGES.LOGIN_FAILED,
    });
  };

  static invalidEmailPassword = (message: string) => {
    return new AuthenticationError({
      message: message || ERROR_MESSAGES.INVALID_EMAIL_PASSWORD,
    });
  };

  static googleSignInFailed = (message: string) => {
    return new AuthenticationError({
      message: message || ERROR_MESSAGES.GOOGLE_SIGN_IN_FAILED,
    });
  };

  static facebookSignInFailed = (message: string) => {
    return new AuthenticationError({
      message: message || ERROR_MESSAGES.FACEBOOK_SIGN_IN_FAILED,
    });
  };

  static signUpFailed = (message: string) => {
    return new AuthenticationError({
      message: message || ERROR_MESSAGES.SIGNUP_FAILED,
    });
  };

  static signUpWithEmailRegistered = () => {
    return new AuthenticationError({
      message: ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED,
    });
  };

  static createAccountFailed = (message: string) => {
    return new AuthenticationError({
      message: message || ERROR_MESSAGES.CREATE_ACCOUNT_FAILED,
    });
  };

  static signOutFailed = (message: string) => {
    return new AuthenticationError({
      message: message || ERROR_MESSAGES.SIGN_OUT_FAILED,
    });
  };

  static confirmAccountFailed = (message: string) => {
    return new AuthenticationError({
      message: message || ERROR_MESSAGES.CONFIRM_ACCOUNT_FAILED,
    });
  };

  static updateFailed = (message: string) => {
    return new AuthenticationError({
      message: message || ERROR_MESSAGES.UPDATE_FAILED,
    });
  };

  static updateProfileFailed = (message: string) => {
    return new AuthenticationError({
      message: message || ERROR_MESSAGES.UPDATE_PROFILE_FAILED,
    });
  };

  static updatePasswordFailed = (message: string) => {
    return new AuthenticationError({
      message: message || ERROR_MESSAGES.UPDATE_PASSWORD_FAILED,
    });
  };

  static currentPasswordIncorrect = (message: string) => {
    return new AuthenticationError({
      message: message || ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT,
    });
  };
}
