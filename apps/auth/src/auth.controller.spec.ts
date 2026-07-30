import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('login delegates to the service with email and password', async () => {
    service.login.mockResolvedValue({ accessToken: 'signed-token' });

    const result = await controller.login({
      email: 'user@example.com',
      password: 'Good_user@123',
    });

    expect(result).toEqual({ accessToken: 'signed-token' });
    expect(service.login).toHaveBeenCalledWith(
      'user@example.com',
      'Good_user@123',
    );
  });

  it('register delegates to the service with the payload', async () => {
    service.register.mockResolvedValue({ accessToken: 'signed-token' });

    const payload = {
      firstName: 'Jimmy',
      lastName: 'Outaly',
      email: 'jimmy@example.com',
      phoneNumber: '0987654321',
      password: 'Good_user@123',
    };

    const result = await controller.register(payload);

    expect(result).toEqual({ accessToken: 'signed-token' });
    expect(service.register).toHaveBeenCalledWith(payload);
  });
});
