import { Data } from 'effect';

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
      message: message,
    });
  };

  static cinemaHallNotFound = (message: string) => {
    return new CinemaError({
      message: message,
    });
  };
}
