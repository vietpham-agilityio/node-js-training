import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import type { Request, Response } from 'express';
import type { Observable } from 'rxjs';

import type { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface';

// DDR-008: one structured line per request — method, path, status, duration
// and user id. Logged on the response's `finish` event rather than in the
// RxJS pipeline so the status code is whatever AllExceptionsFilter actually
// sent, on both the success and error paths.
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectPinoLogger(LoggingInterceptor.name)
    private readonly logger: PinoLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<
      Request & { user?: AuthenticatedUser }
    >();
    const response = httpContext.getResponse<Response>();
    const start = Date.now();

    response.on('finish', () => {
      this.logger.info(
        {
          method: request.method,
          path: request.originalUrl,
          statusCode: response.statusCode,
          durationMs: Date.now() - start,
          userId: request.user?.id ?? null,
        },
        'request completed',
      );
    });

    return next.handle();
  }
}
