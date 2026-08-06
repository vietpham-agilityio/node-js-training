import { Test, TestingModule } from '@nestjs/testing';
import { AuthProxyController } from '..';
import { AuthProxyService } from '../../services';

describe('AuthProxyController', () => {
  let controller: AuthProxyController;
  let service: jest.Mocked<AuthProxyService>;

  beforeEach(async () => {
    const mockAuthProxyService = {
      login: jest.fn(),
      register: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthProxyController],
      providers: [
        { provide: AuthProxyService, useValue: mockAuthProxyService },
      ],
    }).compile();

    controller = module.get<AuthProxyController>(AuthProxyController);
    service = module.get(AuthProxyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('login delegates to the proxy service with email and password', async () => {
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

  it('register delegates to the proxy service with the body', async () => {
    service.register.mockResolvedValue({ accessToken: 'signed-token' });

    const body = {
      firstName: 'Jimmy',
      lastName: 'Outaly',
      email: 'jimmy@example.com',
      phoneNumber: '0987654321',
      password: 'Good_user@123',
    };

    const result = await controller.register(body);

    expect(result).toEqual({ accessToken: 'signed-token' });
    expect(service.register).toHaveBeenCalledWith(body);
  });
});
