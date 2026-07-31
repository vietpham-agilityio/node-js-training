import { ArgumentsHost, ConflictException, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpErrorFilter } from '../http-error.filter';

describe('HttpErrorFilter', () => {
  const filter = new HttpErrorFilter();

  const createMockHost = (url: string) => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status };
    const request = { url };

    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    return { host, status, json };
  };

  it('responds with the exception status and message for a string response body', () => {
    const { host, status, json } = createMockHost('/users/1');

    filter.catch(new NotFoundException('User with ID 1 not found'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'User with ID 1 not found',
      timestamp: expect.any(String),
      path: '/users/1',
    });
  });

  it('responds with the exception status and message for a default HttpException response body', () => {
    const { host, status, json } = createMockHost('/users');

    filter.catch(
      new ConflictException('Email vion@gmail.com is already registered'),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'Email vion@gmail.com is already registered',
      timestamp: expect.any(String),
      path: '/users',
    });
  });

  it('extracts the message array from a ValidationPipe-style response body', () => {
    const { host, status, json } = createMockHost('/products');

    filter.catch(
      new (class extends NotFoundException {
        constructor() {
          super({
            statusCode: HttpStatus.BAD_REQUEST,
            message: ['name should not be empty', 'price must be a number'],
            error: 'Bad Request',
          });
        }
      })(),
      host,
    );

    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: ['name should not be empty', 'price must be a number'],
      timestamp: expect.any(String),
      path: '/products',
    });
  });

  it('falls back to a generic message when the response body has none', () => {
    const { host, status, json } = createMockHost('/orders');

    filter.catch(
      new (class extends NotFoundException {
        constructor() {
          super({ statusCode: HttpStatus.NOT_FOUND });
        }
      })(),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Internal server error',
      timestamp: expect.any(String),
      path: '/orders',
    });
  });

  it('includes an ISO timestamp and the request path', () => {
    const { host, json } = createMockHost('/inventory/1/stock');

    filter.catch(new NotFoundException('Product 1 not found'), host);

    const call = json.mock.calls[0][0];
    expect(call.path).toBe('/inventory/1/stock');
    expect(new Date(call.timestamp).toISOString()).toBe(call.timestamp);
  });
});
