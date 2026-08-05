import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { UserProxyService } from '..';

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
        password: 'good_user@123',
      });

      expect(result).toEqual({ id: 1 });
      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3003/users',
        {
          firstName: 'Jimmy',
          lastName: 'Outaly',
          email: 'jimmy@example.com',
          phoneNumber: '0987654321',
          password: 'good_user@123',
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
        'http://localhost:3003/users',
        {},
      );
    });

    it('forwards the incoming Authorization header', async () => {
      httpService.get.mockReturnValue(of({ data: [{ id: 1 }] }) as never);

      await service.findAll('Bearer abc.def.ghi');

      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:3003/users',
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
    it('requests the user by id', async () => {
      httpService.get.mockReturnValue(of({ data: { id: 5 } }) as never);

      const result = await service.findOne(5);

      expect(result).toEqual({ id: 5 });
      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:3003/users/5',
        {},
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
        {},
      );
    });
  });

  describe('remove', () => {
    it('deletes the user by id', async () => {
      httpService.delete.mockReturnValue(of({ data: undefined }) as never);

      await service.remove(5);

      expect(httpService.delete).toHaveBeenCalledWith(
        'http://localhost:3003/users/5',
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

    it('falls back to a generic message when the downstream response has no message field', async () => {
      httpService.get.mockReturnValue(
        throwError(() => ({
          isAxiosError: true,
          response: { status: HttpStatus.INTERNAL_SERVER_ERROR, data: {} },
        })) as never,
      );

      await expect(service.findAll()).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'User service error',
      });
    });

    it('preserves an array of downstream validation messages', async () => {
      httpService.post.mockReturnValue(
        throwError(() => ({
          isAxiosError: true,
          response: {
            status: HttpStatus.BAD_REQUEST,
            data: { message: ['email must be a valid email'] },
          },
        })) as never,
      );

      const error = (await service
        .create({
          firstName: 'Jimmy',
          lastName: 'Outaly',
          email: 'not-an-email',
          phoneNumber: '0987654321',
          password: 'good_user@123',
        })
        .catch((e) => e)) as HttpException;

      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(error.getResponse()).toEqual({
        message: ['email must be a valid email'],
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
