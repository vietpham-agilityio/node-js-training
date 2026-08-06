import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { USER_ROLE } from '@app/constants';

describe('AuthService', () => {
  let service: AuthService;
  let userClient: jest.Mocked<Pick<ClientProxy, 'send'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  beforeEach(async () => {
    const mockUserClient = { send: jest.fn() };
    const mockJwtService = { signAsync: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'USER_SERVICE', useValue: mockUserClient },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userClient = module.get('USER_SERVICE');
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('validates credentials via TCP and signs a token with sub/email/role', async () => {
      userClient.send.mockReturnValue(
        of({ id: 1, email: 'user@example.com', role: USER_ROLE.USER }),
      );
      jwtService.signAsync.mockResolvedValue('signed-token');

      const result = await service.login('user@example.com', 'Good_user@123');

      expect(result).toEqual({ accessToken: 'signed-token' });
      expect(userClient.send).toHaveBeenCalledWith(
        'user_validate_credentials',
        {
          email: 'user@example.com',
          password: 'Good_user@123',
        },
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: 'user@example.com',
        role: USER_ROLE.USER,
      });
    });
  });

  describe('register', () => {
    it('creates the user via TCP forcing role to USER, then signs a token', async () => {
      userClient.send.mockReturnValue(
        of({
          id: 2,
          email: 'jimmy@example.com',
          role: USER_ROLE.USER,
        }),
      );
      jwtService.signAsync.mockResolvedValue('signed-token');

      const payload = {
        firstName: 'Jimmy',
        lastName: 'Outaly',
        email: 'jimmy@example.com',
        phoneNumber: '0987654321',
        password: 'Good_user@123',
      };

      const result = await service.register(payload);

      expect(result).toEqual({ accessToken: 'signed-token' });
      expect(userClient.send).toHaveBeenCalledWith('user_create_user', {
        ...payload,
        role: USER_ROLE.USER,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 2,
        email: 'jimmy@example.com',
        role: USER_ROLE.USER,
      });
    });
  });
});
