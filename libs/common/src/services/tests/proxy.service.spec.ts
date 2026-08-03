import { HttpException, HttpStatus } from '@nestjs/common';
import { KnownProxyError, ProxyService } from '../proxy.service';

class TestProxyService extends ProxyService {
  constructor(
    private readonly known: KnownProxyError | undefined,
    private readonly fallback: HttpException,
  ) {
    super();
  }

  call(error: unknown): HttpException {
    return this.toHttpException(error);
  }

  protected extractKnownError(): KnownProxyError | undefined {
    return this.known;
  }

  protected fallbackException(): HttpException {
    return this.fallback;
  }
}

describe('ProxyService', () => {
  it('builds an HttpException from the known error when one is extracted', () => {
    const service = new TestProxyService(
      { status: HttpStatus.NOT_FOUND, message: 'not found' },
      new HttpException('unused fallback', HttpStatus.BAD_GATEWAY),
    );

    const result = service.call(new Error('boom'));

    expect(result).toBeInstanceOf(HttpException);
    expect(result.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(result.message).toBe('not found');
  });

  it('delegates to fallbackException when no known error is extracted', () => {
    const fallback = new HttpException('service down', HttpStatus.BAD_GATEWAY);
    const service = new TestProxyService(undefined, fallback);

    const result = service.call(new Error('boom'));

    expect(result).toBe(fallback);
  });
});
