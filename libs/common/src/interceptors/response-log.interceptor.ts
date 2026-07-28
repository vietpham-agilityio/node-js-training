import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { catchError, map, Observable, throwError } from 'rxjs';
import type { Request } from 'express';

@Injectable()
export class ResponseLoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const executionTime = Date.now() - startTime;
        console.log(`Request to ${request.url} took ${executionTime}ms`);

        return {
          success: !(data instanceof Error) && data !== null,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
      catchError((error: unknown) => {
        const responseTime = Date.now() - startTime;
        console.log(`Request to ${request.url} failed after ${responseTime}ms`);

        return throwError(() => error);
      }),
    );
  }
}
