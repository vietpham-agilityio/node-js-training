import { HttpException, HttpStatus } from '@nestjs/common';
import { extractErrorMessage } from '../utils/extract-error-message';
import { KnownProxyError, ProxyService } from './proxy.service';

export abstract class TCPProxyService extends ProxyService {
  protected abstract readonly unavailableMessage: string;

  protected extractKnownError(error: unknown): KnownProxyError | undefined {
    const status = this.extractStatus(error);
    if (typeof status !== 'number' || !this.acceptStatus(status)) {
      return undefined;
    }

    return {
      status,
      message: extractErrorMessage(error, this.statusFallbackMessage(status)),
    };
  }

  protected fallbackException(error: unknown): HttpException {
    return new HttpException(
      extractErrorMessage(error, this.unavailableMessage),
      HttpStatus.BAD_GATEWAY,
    );
  }

  protected acceptStatus(_status: number): boolean {
    return true;
  }

  protected abstract statusFallbackMessage(status: number): string;

  private extractStatus(error: unknown): number | undefined {
    return typeof error === 'object' && error !== null && 'status' in error
      ? (error as { status?: number }).status
      : undefined;
  }
}
