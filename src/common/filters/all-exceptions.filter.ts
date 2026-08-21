import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

import { AppException } from '../exceptions/app.exception';

export interface ErrorResponseBody {
  statusCode: number;
  errorCode: string;
  message: string | string[];
  timestamp: string;
}

/**
 * Turns anything thrown inside the request pipeline into one consistent JSON
 * shape (DDR-006). Unknown errors are logged with their stack but reported
 * as a plain 500 so internals never reach the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ method: string; url: string }>();

    const status: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ErrorResponseBody = {
      statusCode: status,
      ...this.describe(exception, status),
      timestamp: new Date().toISOString(),
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(body);
  }

  private describe(
    exception: unknown,
    status: HttpStatus,
  ): Pick<ErrorResponseBody, 'message' | 'errorCode'> {
    if (exception instanceof AppException) {
      return { message: exception.message, errorCode: exception.errorCode };
    }

    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      const message =
        typeof payload === 'string'
          ? payload
          : ((payload as { message?: string | string[] }).message ??
            exception.message);

      return { message, errorCode: HttpStatus[status] ?? 'ERROR' };
    }

    return {
      message: 'Internal server error',
      errorCode: 'INTERNAL_SERVER_ERROR',
    };
  }
}
