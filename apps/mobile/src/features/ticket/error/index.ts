import { ERROR_MESSAGES } from '@/constants/messages';
import { Data } from 'effect';

export class TicketError extends Data.TaggedError('TicketError')<{
  message: string;
  cause?: unknown;
}> {
  getCause() {
    return this.cause;
  }

  getDetails() {
    return {
      message: this.message,
      cause: this.cause,
    };
  }

  hasCause() {
    return this.cause !== undefined;
  }

  static ticketNetworkError = (message: string) => {
    return new TicketError({
      message: message || ERROR_MESSAGES.TICKET_NETWORK_ERROR,
    });
  };

  static ticketNotFound = (message: string) => {
    return new TicketError({
      message: message || ERROR_MESSAGES.INVALID_TICKET,
    });
  };

  static ticketAlreadyUsed = (message: string) => {
    return new TicketError({
      message: message || ERROR_MESSAGES.TICKET_ALREADY_USED,
    });
  };

  static ticketExpired = (message: string) => {
    return new TicketError({
      message: message || ERROR_MESSAGES.TICKET_EXPIRED,
    });
  };

  static ticketInvalidFormat = (message: string) => {
    return new TicketError({
      message: message || ERROR_MESSAGES.TICKET_INVALID_FORMAT,
    });
  };

  static ticketValidationFailed = (message: string) => {
    return new TicketError({
      message: message || ERROR_MESSAGES.TICKET_VALIDATION_FAILED,
    });
  };

  static ticketExpirationFailed = (message: string) => {
    return new TicketError({
      message: message || ERROR_MESSAGES.SOMETHING_WENT_WRONG,
    });
  };
}
