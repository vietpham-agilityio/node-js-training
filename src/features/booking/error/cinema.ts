import { Data } from 'effect';

// Constants
import { ERROR_MESSAGES } from '@/constants/messages';

export class CinemaError extends Data.TaggedError('CinemaError')<{
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
      tag: this._tag,
    };
  }

  static cinemaNotFound = (message: string) => {
    return new CinemaError({
      message: message || ERROR_MESSAGES.CINEMA_NOT_FOUND,
    });
  };

  static cinemaHallNotFound = (message: string) => {
    return new CinemaError({
      message: message || ERROR_MESSAGES.CINEMA_HALL_NOT_FOUND,
    });
  };
}
