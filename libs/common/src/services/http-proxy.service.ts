import { HttpException, HttpStatus } from '@nestjs/common';
import { catchError, firstValueFrom, map, Observable, tap } from 'rxjs';

// Module
import { KnownProxyError, ProxyService } from './proxy.service';

interface AxiosLikeError {
  isAxiosError?: boolean;
  response?: { status: number; data: unknown };
}

interface AxiosLikeResponse<T> {
  data: T;
  headers?: Record<string, unknown>;
}

/**
 * Anything that can carry a response header — Express's `Response` satisfies
 * this structurally, so libs/common stays free of a transport dependency.
 */
export interface HeaderSink {
  setHeader(name: string, value: string): void;
}

export abstract class HttpProxyService extends ProxyService {
  protected abstract readonly serviceName: string;

  protected forward<T>(
    observable: Observable<AxiosLikeResponse<T>>,
    httpResponse?: HeaderSink,
  ): Promise<T> {
    return firstValueFrom(
      observable.pipe(
        tap((response) => this.forwardCacheHeader(response, httpResponse)),
        map((response) => response.data),
        catchError((error: unknown) => {
          throw this.toHttpException(error);
        }),
      ),
    );
  }

  protected withAuth(authorization?: string): {
    headers?: Record<string, string>;
  } {
    return authorization ? { headers: { Authorization: authorization } } : {};
  }

  private forwardCacheHeader(
    response: AxiosLikeResponse<unknown>,
    httpResponse?: HeaderSink,
  ): void {
    const cacheStatus = response.headers?.['x-cache'];

    if (httpResponse && typeof cacheStatus === 'string') {
      httpResponse.setHeader('X-Cache', cacheStatus);
    }
  }

  protected extractKnownError(error: unknown): KnownProxyError | undefined {
    const response = this.asAxiosError(error)?.response;
   
    if (!response) {
      return undefined;
    }

    const { status, data } = response;
    
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? (data as { message: string | string[] }).message
        : `${this.serviceName} service error`;

    return { status, message: { message } };
  }

  protected fallbackException(error: unknown): HttpException {
    if (this.asAxiosError(error)) {
      return new HttpException(
        `${this.serviceName} service unavailable`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    return new HttpException(
      `Unexpected error calling ${this.serviceName.toLowerCase()} service`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private asAxiosError(error: unknown): AxiosLikeError | undefined {
    return typeof error === 'object' &&
      error !== null &&
      (error as AxiosLikeError).isAxiosError
      ? (error as AxiosLikeError)
      : undefined;
  }
}
