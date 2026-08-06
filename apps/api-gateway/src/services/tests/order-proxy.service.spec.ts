import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { OrderProxyService } from '../';

describe('OrderProxyService', () => {
  let service: OrderProxyService;
  let httpService: jest.Mocked<
    Pick<HttpService, 'get' | 'post' | 'patch' | 'delete'>
  >;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderProxyService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<OrderProxyService>(OrderProxyService);
    httpService = module.get(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('forwards to order-create and unwraps the response data', async () => {
      httpService.post.mockReturnValue(of({ data: { id: 1 } }) as never);

      const result = await service.createOrder({
        name: 'x',
        productId: 12,
        quantity: 2,
      });

      expect(result).toEqual({ id: 1 });
      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3001/orders',
        { name: 'x', productId: 12, quantity: 2 },
        {},
      );
    });
  });

  describe('findAll', () => {
    it('unwraps the list response', async () => {
      httpService.get.mockReturnValue(of({ data: [{ id: 1 }] }) as never);

      const result = await service.findAll();

      expect(result).toEqual([{ id: 1 }]);
      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:3001/orders',
        {},
      );
    });

    it('forwards the incoming Authorization header', async () => {
      httpService.get.mockReturnValue(of({ data: [{ id: 1 }] }) as never);

      await service.findAll('Bearer abc.def.ghi');

      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:3001/orders',
        { headers: { Authorization: 'Bearer abc.def.ghi' } },
      );
    });
  });

  describe('findOne', () => {
    it('requests the order by id', async () => {
      httpService.get.mockReturnValue(of({ data: { id: 5 } }) as never);

      const result = await service.findOne(5);

      expect(result).toEqual({ id: 5 });
      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:3001/orders/5',
        {},
      );
    });
  });

  describe('updateOrder', () => {
    it('patches the order by id', async () => {
      httpService.patch.mockReturnValue(of({ data: { id: 5 } }) as never);

      const result = await service.updateOrder(5, { quantity: 2 });

      expect(result).toEqual({ id: 5 });
      expect(httpService.patch).toHaveBeenCalledWith(
        'http://localhost:3001/orders/5',
        { quantity: 2 },
        {},
      );
    });
  });

  describe('removeOrder', () => {
    it('deletes the order by id', async () => {
      httpService.delete.mockReturnValue(of({ data: { id: 5 } }) as never);

      const result = await service.removeOrder(5);

      expect(result).toEqual({ id: 5 });
      expect(httpService.delete).toHaveBeenCalledWith(
        'http://localhost:3001/orders/5',
        {},
      );
    });
  });

  describe('error translation', () => {
    it('re-throws downstream status/message as an HttpException', async () => {
      httpService.get.mockReturnValue(
        throwError(() => ({
          isAxiosError: true,
          response: { status: 404, data: { message: 'not found' } },
        })),
      );

      await expect(service.findOne(999)).rejects.toMatchObject({
        message: 'not found',
        status: 404,
      });
    });

    it('maps unreachable order service to a 502', async () => {
      httpService.get.mockReturnValue(
        throwError(() => ({ isAxiosError: true })),
      );

      await expect(service.findAll()).rejects.toMatchObject({
        status: HttpStatus.BAD_GATEWAY,
      });
    });

    it('falls back to a generic message when the downstream response has no message field', async () => {
      httpService.get.mockReturnValue(
        throwError(() => ({
          isAxiosError: true,
          response: { status: HttpStatus.INTERNAL_SERVER_ERROR, data: {} },
        })),
      );

      await expect(service.findAll()).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Order service error',
      });
    });

    it('preserves an array of downstream validation messages', async () => {
      httpService.post.mockReturnValue(
        throwError(() => ({
          isAxiosError: true,
          response: {
            status: HttpStatus.BAD_REQUEST,
            data: { message: ['quantity must be positive'] },
          },
        })),
      );

      const error = (await service
        .createOrder({ name: 'x', productId: 1, quantity: -1 })
        .catch((e: unknown) => e)) as HttpException;

      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(error.getResponse()).toEqual({
        message: ['quantity must be positive'],
      });
    });

    it('maps unexpected errors to a 500', async () => {
      httpService.get.mockReturnValue(throwError(() => new Error('boom')));

      const error = (await service
        .findAll()
        .catch((e: unknown) => e)) as HttpException;

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
