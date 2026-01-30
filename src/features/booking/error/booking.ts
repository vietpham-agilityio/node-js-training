import { Data } from 'effect';

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
      message: message,
    });
  };

  static ticketAlreadyUsed = (message: string) => {
    return new BookingError({
      message: message,
    });
  };

  static ticketExpired = (message: string) => {
    return new BookingError({
      message: message,
    });
  };

  static ticketInvalidFormat = (message: string) => {
    return new BookingError({
      message: message,
    });
  };

  static ticketNetworkError = (message: string) => {
    return new BookingError({
      message: message,
    });
  };

  static checkoutFailed = (message: string) => {
    return new BookingError({
      message: message,
    });
  };

  static ticketValidationFailed = (message: string) => {
    return new BookingError({
      message: message,
    });
  };

  static noResultReturnedFromBookingTransaction = (message: string) => {
    return new BookingError({
      message: message,
    });
  };

  static bookingFailed = (message: string) => {
    return new BookingError({
      message: message,
    });
  };

  static cancelBookingFailed = (message: string) => {
    return new BookingError({
      message: message,
    });
  };

  static insufficientWalletBalance = (message: string) => {
    return new BookingError({
      message: message,
    });
  };

  static walletNotFound = (message: string) => {
    return new BookingError({
      message: message,
    });
  };

  static bookingNotFound = (message: string) => {
    return new BookingError({
      message: message,
    });
  };

  static bookingAlreadyCancelled = (message: string) => {
    return new BookingError({
      message: message,
    });
  };

  static reserveSeatsFailed = (message: string) => {
    return new BookingError({
      message: message,
    });
  };

  static releaseSeatsFailed = (message: string) => {
    return new BookingError({
      message: message,
    });
  };
}
