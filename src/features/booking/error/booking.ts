import { Data } from 'effect';

// Constants
import { ERROR_MESSAGES } from '@/constants/messages';

export class BookingError extends Data.TaggedError('BookingError')<{
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

  static invalidTicket = (message: string) => {
    return new BookingError({
      message: message || ERROR_MESSAGES.INVALID_TICKET,
    });
  };

  static ticketAlreadyUsed = (message: string) => {
    return new BookingError({
      message: message || ERROR_MESSAGES.TICKET_ALREADY_USED,
    });
  };

  static ticketExpired = (message: string) => {
    return new BookingError({
      message: message || ERROR_MESSAGES.TICKET_EXPIRED,
    });
  };

  static ticketInvalidFormat = (message: string) => {
    return new BookingError({
      message: message || ERROR_MESSAGES.TICKET_INVALID_FORMAT,
    });
  };

  static ticketNetworkError = (message: string) => {
    return new BookingError({
      message: message || ERROR_MESSAGES.TICKET_NETWORK_ERROR,
    });
  };

  static checkoutFailed = (message: string) => {
    return new BookingError({
      message: message || ERROR_MESSAGES.CHECKOUT_FAILED,
    });
  };

  static ticketValidationFailed = (message: string) => {
    return new BookingError({
      message: message || ERROR_MESSAGES.TICKET_VALIDATION_FAILED,
    });
  };
}
