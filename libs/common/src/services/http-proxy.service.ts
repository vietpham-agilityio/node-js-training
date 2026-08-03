import { HttpException, HttpStatus } from '@nestjs/common';
import { KnownProxyError, ProxyService } from './proxy.service';

interface AxiosLikeError {
  isAxiosError?: boolean;
  response?: { status: number; data: unknown };
}

export abstract class HttpProxyService extends ProxyService {
  protected abstract readonly serviceName: string;

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
