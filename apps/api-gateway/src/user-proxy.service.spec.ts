import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { UserProxyService } from './user-proxy.service';

describe('UserProxyService', () => {
  let service: UserProxyService;
  let httpService: jest.Mocked<
    Pick<HttpService, 'get' | 'post' | 'put' | 'delete'>
  >;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProxyService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<UserProxyService>(UserProxyService);
    httpService = module.get(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('forwards to user-create and unwraps the response data', async () => {
      httpService.post.mockReturnValue(of({ data: { id: 1 } }) as never);

      const result = await service.create({
        firstName: 'Jimmy',
        lastName: 'Outaly',
        email: 'jimmy@example.com',
        phoneNumber: '0987654321',
      });

      expect(result).toEqual({ id: 1 });
      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3003/users',
        {
          firstName: 'Jimmy',
          lastName: 'Outaly',
          email: 'jimmy@example.com',
          phoneNumber: '0987654321',
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
        'http://localhost:3003/users',
      );
    });
  });

  describe('findOne', () => {
    it('requests the user by id', async () => {
      httpService.get.mockReturnValue(of({ data: { id: 5 } }) as never);

      const result = await service.findOne(5);

      expect(result).toEqual({ id: 5 });
      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:3003/users/5',
      );
    });
  });

  describe('update', () => {
    it('puts the user by id', async () => {
      httpService.put.mockReturnValue(of({ data: { id: 5 } }) as never);

      const result = await service.update(5, { firstName: 'New' });

      expect(result).toEqual({ id: 5 });
      expect(httpService.put).toHaveBeenCalledWith(
        'http://localhost:3003/users/5',
        { firstName: 'New' },
      );
    });
  });

  describe('remove', () => {
    it('deletes the user by id', async () => {
      httpService.delete.mockReturnValue(of({ data: undefined }) as never);

      await service.remove(5);

      expect(httpService.delete).toHaveBeenCalledWith(
        'http://localhost:3003/users/5',
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

    it('maps unreachable user service to a 502', async () => {
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
