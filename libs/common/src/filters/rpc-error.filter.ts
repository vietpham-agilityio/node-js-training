import {
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

interface RpcErrorPayload {
  status: number;
  message: string | string[];
}

@Catch()
export class RpcErrorFilter implements ExceptionFilter<unknown> {
  catch(exception: unknown): Observable<never> {
    return throwError(() => this.toPayload(exception));
  }

  private toPayload(exception: unknown): RpcErrorPayload {
    if (exception instanceof RpcException) {
      const error = exception.getError();
      return this.isRpcErrorPayload(error)
        ? error
        : { status: HttpStatus.INTERNAL_SERVER_ERROR, message: String(error) };
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : ((response as { message?: string | string[] }).message ??
            exception.message);

      return { status: exception.getStatus(), message };
    }

    if (this.isRpcErrorPayload(exception)) {
      return exception;
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  private isRpcErrorPayload(value: unknown): value is RpcErrorPayload {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as RpcErrorPayload).status === 'number' &&
      'message' in value
    );
  }
}
