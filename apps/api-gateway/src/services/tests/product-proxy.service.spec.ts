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
      );
    });
  });

  describe('findOne', () => {
    it('requests the product by id', async () => {
      httpService.get.mockReturnValue(of({ data: { id: 5 } }) as never);

      const result = await service.findOne(5);

      expect(result).toEqual({ id: 5 });
      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:3004/products/5',
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
      );
    });
  });

  describe('remove', () => {
    it('deletes the product by id', async () => {
      httpService.delete.mockReturnValue(of({ data: undefined }) as never);

      await service.remove(5);

      expect(httpService.delete).toHaveBeenCalledWith(
        'http://localhost:3004/products/5',
      );
    });
  });

  describe('error translation', () => {
    it('re-throws downstream status/message as an HttpException', async () => {
      httpService.get.mockReturnValue(
        throwError(() => ({
          isAxiosError: true,
          response: { status: 404, data: { message: 'not found' } },
        })) as never,
      );

      await expect(service.findOne(999)).rejects.toMatchObject({
        message: 'not found',
        status: 404,
      });
    });

    it('maps unreachable product service to a 502', async () => {
      httpService.get.mockReturnValue(
        throwError(() => ({ isAxiosError: true })) as never,
      );

      await expect(service.findAll()).rejects.toMatchObject({
        status: HttpStatus.BAD_GATEWAY,
      });
    });

    it('maps unexpected errors to a 500', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error('boom')) as never,
      );

      const error = (await service.findAll().catch((e) => e)) as HttpException;

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
