import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable()
export class ResponseLoggingInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    return next.handle().pipe(
      map((data) => ({
        success: !(data instanceof Error) && data !== null,
        data,
        timestamp: new Date().toISOString(),
      })),
      catchError((error: unknown) => throwError(() => error)),
    );
  }
}
