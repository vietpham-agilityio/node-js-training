import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AuthProxyService } from '../';

describe('AuthProxyService', () => {
  let service: AuthProxyService;
  let authClient: jest.Mocked<Pick<ClientProxy, 'send'>>;

  beforeEach(async () => {
    const mockAuthClient = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthProxyService,
        { provide: 'AUTH_SERVICE', useValue: mockAuthClient },
      ],
    }).compile();

    service = module.get<AuthProxyService>(AuthProxyService);
    authClient = module.get('AUTH_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('sends the login message and returns the access token', async () => {
      authClient.send.mockReturnValue(
        of({ accessToken: 'signed-token' }) as never,
      );

      const result = await service.login('user@example.com', 'Good_user@123');

      expect(result).toEqual({ accessToken: 'signed-token' });
      expect(authClient.send).toHaveBeenCalledWith('auth_login', {
        email: 'user@example.com',
        password: 'Good_user@123',
      });
    });

    it('maps an unauthorized error into a 401 HttpException', async () => {
      authClient.send.mockReturnValue(
        throwError(() => ({
          status: HttpStatus.UNAUTHORIZED,
          message: 'Invalid email or password',
        })) as never,
      );

      await expect(
        service.login('user@example.com', 'wrong-password'),
      ).rejects.toMatchObject({
        message: 'Invalid email or password',
        status: HttpStatus.UNAUTHORIZED,
      });
    });

    it('maps an unrecognized error into a 502', async () => {
      authClient.send.mockReturnValue(
        throwError(() => new Error('boom')) as never,
      );

      await expect(
        service.login('user@example.com', 'Good_user@123'),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_GATEWAY,
      });
    });

    it('maps a connection-refused error (empty message) into a 502 with a meaningful message', async () => {
      authClient.send.mockReturnValue(
        throwError(() => ({ code: 'ECONNREFUSED', message: '' })) as never,
      );

      await expect(
        service.login('user@example.com', 'Good_user@123'),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_GATEWAY,
        message: 'Auth service unavailable (ECONNREFUSED)',
      });
    });

    it('maps a non-401 status error into a generic auth-service-error message', async () => {
      authClient.send.mockReturnValue(
        throwError(() => ({ status: HttpStatus.INTERNAL_SERVER_ERROR })) as never,
      );

      await expect(
        service.login('user@example.com', 'Good_user@123'),
      ).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Auth service error',
      });
    });
  });

  describe('register', () => {
    it('sends the register message and returns the access token', async () => {
      authClient.send.mockReturnValue(
        of({ accessToken: 'signed-token' }) as never,
      );

      const payload = {
        firstName: 'Jimmy',
        lastName: 'Outaly',
        email: 'jimmy@example.com',
        phoneNumber: '0987654321',
        password: 'Good_user@123',
      };

      const result = await service.register(payload);

      expect(result).toEqual({ accessToken: 'signed-token' });
      expect(authClient.send).toHaveBeenCalledWith('auth_register', payload);
    });

    it('maps a conflict error (e.g. duplicate email) into a 409 HttpException', async () => {
      authClient.send.mockReturnValue(
        throwError(() => ({
          status: HttpStatus.CONFLICT,
          message: 'Email jimmy@example.com is already registered',
        })) as never,
      );

      await expect(
        service.register({
          firstName: 'Jimmy',
          lastName: 'Outaly',
          email: 'jimmy@example.com',
          phoneNumber: '0987654321',
          password: 'Good_user@123',
        }),
      ).rejects.toMatchObject({
        message: 'Email jimmy@example.com is already registered',
        status: HttpStatus.CONFLICT,
      });
    });
  });
});
