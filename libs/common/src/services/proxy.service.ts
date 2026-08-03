import { HttpException } from '@nestjs/common';

export interface KnownProxyError {
  status: number;
  message: string | string[] | Record<string, any>;
}

export abstract class ProxyService {
  protected toHttpException(error: unknown): HttpException {
    const known = this.extractKnownError(error);

    if (known) return new HttpException(known.message, known.status);

    return this.fallbackException(error);
  }

  protected abstract extractKnownError(
    error: unknown,
  ): KnownProxyError | undefined;

  protected abstract fallbackException(error: unknown): HttpException;
}
