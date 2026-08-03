import { HttpException, HttpStatus } from '@nestjs/common';
import { TCPProxyService } from '../tcp-proxy.service';

class TestTcpProxyService extends TCPProxyService {
  protected readonly unavailableMessage = 'Test service unavailable';

  constructor(
    private readonly accept: (status: number) => boolean = () => true,
    private readonly fallbackMessage: string = 'Test service error',
  ) {
    super();
  }

  call(error: unknown): HttpException {
    return this.toHttpException(error);
  }

  protected acceptStatus(status: number): boolean {
    return this.accept(status);
  }

  protected statusFallbackMessage(): string {
    return this.fallbackMessage;
  }
}

describe('TCPProxyService', () => {
  it('maps an accepted numeric status into a matching HttpException', () => {
    const service = new TestTcpProxyService();

    const result = service.call({
      status: HttpStatus.CONFLICT,
      message: 'duplicate entry',
    });

    expect(result.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(result.message).toBe('duplicate entry');
  });

  it('falls back to the status fallback message when the error has no message', () => {
    const service = new TestTcpProxyService();

    const result = service.call({ status: HttpStatus.CONFLICT });

    expect(result.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(result.message).toBe('Test service error');
  });

  it('rejects a status the subclass does not accept and falls back to 502', () => {
    const service = new TestTcpProxyService((status) => status === HttpStatus.NOT_FOUND);

    const result = service.call({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
    expect(result.message).toBe('Test service unavailable');
  });

  it('falls back to 502 when the error carries no numeric status', () => {
    const service = new TestTcpProxyService();

    const result = service.call(new Error('connection reset'));

    expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
    expect(result.message).toBe('connection reset');
  });

  it('appends the error code to the fallback message when there is no message', () => {
    const service = new TestTcpProxyService();

    const result = service.call({ code: 'ECONNREFUSED', message: '' });

    expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
    expect(result.message).toBe('Test service unavailable (ECONNREFUSED)');
  });
});
