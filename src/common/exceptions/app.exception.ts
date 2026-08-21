import { HttpException, HttpStatus } from '@nestjs/common';

import { ErrorCode } from './error-codes';

// DDR-006: a business failure a service throws deliberately, carrying the
// stable errorCode a client can branch on without parsing message text.
export class AppException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    message: string,
    status: HttpStatus,
  ) {
    super(message, status);
  }
}
