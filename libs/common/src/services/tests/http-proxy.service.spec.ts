import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpProxyService } from '../http-proxy.service';

class TestHttpProxyService extends HttpProxyService {
  protected readonly serviceName = 'Test';

  call(error: unknown): HttpException {
    return this.toHttpException(error);
  }
}

describe('HttpProxyService', () => {
  it('re-throws the downstream status/message when the axios error has a response', () => {
    const service = new TestHttpProxyService();

    const result = service.call({
      isAxiosError: true,
      response: {
        status: HttpStatus.NOT_FOUND,
        data: { message: 'not found' },
      },
    });

    expect(result.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(result.message).toBe('not found');
  });

  it('preserves an array of downstream validation messages in the response body', () => {
    const service = new TestHttpProxyService();

    const result = service.call({
      isAxiosError: true,
      response: {
        status: HttpStatus.BAD_REQUEST,
        data: {
          message: ['name should not be empty', 'price must be positive'],
        },
      },
    });

    expect(result.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(result.getResponse()).toEqual({
      message: ['name should not be empty', 'price must be positive'],
    });
  });

  it('falls back to a generic service-error message when the response has no message field', () => {
    const service = new TestHttpProxyService();

    const result = service.call({
      isAxiosError: true,
      response: { status: HttpStatus.INTERNAL_SERVER_ERROR, data: {} },
    });

    expect(result.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(result.message).toBe('Test service error');
  });

  it('maps an axios error without a response to a 502 unavailable', () => {
    const service = new TestHttpProxyService();

    const result = service.call({ isAxiosError: true });

    expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
    expect(result.message).toBe('Test service unavailable');
  });

  it('maps a non-axios error to a 500 unexpected error', () => {
    const service = new TestHttpProxyService();

    const result = service.call(new Error('boom'));

    expect(result.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(result.message).toBe('Unexpected error calling test service');
  });
});
