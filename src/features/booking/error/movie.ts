import { Data } from 'effect';

// Constants
import { ERROR_MESSAGES } from '@/constants/messages';

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
      message: message || ERROR_MESSAGES.MOVIE_NETWORK_ERROR,
    });
  };

  static movieNotFound = (message: string) => {
    return new MovieError({
      message: message || ERROR_MESSAGES.MOVIE_NOT_FOUND,
    });
  };

  static showtimeNotFound = (message: string) => {
    return new MovieError({
      message: message || ERROR_MESSAGES.SHOWTIME_NOT_FOUND,
    });
  };

  static searchFailed = (message: string) => {
    return new MovieError({
      message: message || ERROR_MESSAGES.MOVIE_SEARCH_FAILED,
    });
  };
}
