import { Data } from 'effect';

export class MovieError extends Data.TaggedError('MovieError')<{
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

  static movieNetworkError = (message: string) => {
    return new MovieError({
      message: message,
    });
  };

  static movieNotFound = (message: string) => {
    return new MovieError({
      message: message,
    });
  };

  static showtimeNotFound = (message: string) => {
    return new MovieError({
      message: message,
    });
  };

  static searchFailed = (message: string) => {
    return new MovieError({
      message: message,
    });
  };
}
