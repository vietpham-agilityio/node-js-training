import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { ProductProxyService } from '../';

describe('ProductProxyService', () => {
  let service: ProductProxyService;
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
        ProductProxyService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<ProductProxyService>(ProductProxyService);
    httpService = module.get(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('forwards to product-create and unwraps the response data', async () => {
      httpService.post.mockReturnValue(of({ data: { id: 1 } }) as never);

      const result = await service.create({
        name: 'Sony Camera',
        description: 'Modern camera in future',
        price: 49000000,
        quantity: 100,
      });

      expect(result).toEqual({ id: 1 });
      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3004/products',
        {
          name: 'Sony Camera',
          description: 'Modern camera in future',
          price: 49000000,
          quantity: 100,
        },
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
        'http://localhost:3004/products',
        {},
      );
    });

    it('forwards the incoming Authorization header', async () => {
      httpService.get.mockReturnValue(of({ data: [{ id: 1 }] }) as never);

      await service.findAll('Bearer abc.def.ghi');

      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:3004/products',
        { headers: { Authorization: 'Bearer abc.def.ghi' } },
      );
    });

    it("surfaces the downstream X-Cache header on the gateway's response", async () => {
      httpService.get.mockReturnValue(
        of({ data: [{ id: 1 }], headers: { 'x-cache': 'HIT' } }) as never,
      );
      const setHeader = jest.fn();

      await service.findAll(undefined, { setHeader } as never);

      expect(setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
    });
  });

  describe('findOne', () => {
    it('requests the product by id', async () => {
      httpService.get.mockReturnValue(of({ data: { id: 5 } }) as never);

      const result = await service.findOne(5);

      expect(result).toEqual({ id: 5 });
      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:3004/products/5',
        {},
      );
    });
  });

  describe('update', () => {
    it('patches the product by id', async () => {
      httpService.patch.mockReturnValue(of({ data: { id: 5 } }) as never);

      const result = await service.update(5, { quantity: 2 });

      expect(result).toEqual({ id: 5 });
      expect(httpService.patch).toHaveBeenCalledWith(
        'http://localhost:3004/products/5',
        { quantity: 2 },
        {},
      );
    });
  });

  describe('remove', () => {
    it('deletes the product by id', async () => {
      httpService.delete.mockReturnValue(of({ data: undefined }) as never);

      await service.remove(5);

      expect(httpService.delete).toHaveBeenCalledWith(
        'http://localhost:3004/products/5',
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

    it('maps unreachable product service to a 502', async () => {
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
        message: 'Product service error',
      });
    });

    it('preserves an array of downstream validation messages', async () => {
      httpService.post.mockReturnValue(
        throwError(() => ({
          isAxiosError: true,
          response: {
            status: HttpStatus.BAD_REQUEST,
            data: { message: ['price must be positive'] },
          },
        })),
      );

      const error = (await service
        .create({
          name: 'Sony Camera',
          description: 'Modern camera in future',
          price: -1,
          quantity: 100,
        })
        .catch((e: unknown) => e)) as HttpException;

      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(error.getResponse()).toEqual({
        message: ['price must be positive'],
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
