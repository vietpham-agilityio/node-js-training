import { Test, TestingModule } from '@nestjs/testing';
import { LazyModuleLoader } from '@nestjs/core';
import { AuthProxyController } from '..';

describe('AuthProxyController', () => {
  let controller: AuthProxyController;
  let mockAuthProxyService: { login: jest.Mock; register: jest.Mock };
  let mockLazyModuleLoader: { load: jest.Mock };

  beforeEach(async () => {
    mockAuthProxyService = {
      login: jest.fn(),
      register: jest.fn(),
    };

    mockLazyModuleLoader = {
      load: jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue(mockAuthProxyService),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthProxyController],
      providers: [
        { provide: LazyModuleLoader, useValue: mockLazyModuleLoader },
      ],
    }).compile();

    controller = module.get<AuthProxyController>(AuthProxyController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('login delegates to the proxy service with email and password', async () => {
    mockAuthProxyService.login.mockResolvedValue({
      accessToken: 'signed-token',
    });

    const result = await controller.login({
      email: 'user@example.com',
      password: 'Good_user@123',
    });

    expect(result).toEqual({ accessToken: 'signed-token' });
    expect(mockAuthProxyService.login).toHaveBeenCalledWith(
      'user@example.com',
      'Good_user@123',
    );
  });

  it('register delegates to the proxy service with the body', async () => {
    mockAuthProxyService.register.mockResolvedValue({
      accessToken: 'signed-token',
    });

    const body = {
      firstName: 'Jimmy',
      lastName: 'Outaly',
      email: 'jimmy@example.com',
      phoneNumber: '0987654321',
      password: 'Good_user@123',
    };

    const result = await controller.register(body);

    expect(result).toEqual({ accessToken: 'signed-token' });
    expect(mockAuthProxyService.register).toHaveBeenCalledWith(body);
  });

  it('loads the lazy auth proxy module only once across multiple calls', async () => {
    mockAuthProxyService.login.mockResolvedValue({
      accessToken: 'signed-token',
    });

    await controller.login({ email: 'a@example.com', password: 'pw' });
    await controller.login({ email: 'a@example.com', password: 'pw' });

    expect(mockLazyModuleLoader.load).toHaveBeenCalledTimes(1);
  });
});
