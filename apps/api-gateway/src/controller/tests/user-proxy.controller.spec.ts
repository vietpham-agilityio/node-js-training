import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserProxyController } from '..';
import { UserProxyService } from '../../services';

describe('UserProxyController', () => {
  let controller: UserProxyController;
  let service: jest.Mocked<UserProxyService>;

  beforeEach(async () => {
    const mockUserProxyService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserProxyController],
      providers: [
        { provide: UserProxyService, useValue: mockUserProxyService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
      ],
    }).compile();

    controller = module.get<UserProxyController>(UserProxyController);
    service = module.get(UserProxyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('findAll delegates to the proxy service', async () => {
    service.findAll.mockResolvedValue([{ id: 1 } as never]);

    const result = await controller.findAll();

    expect(result).toEqual([{ id: 1 }]);
    expect(service.findAll).toHaveBeenCalledWith(undefined, undefined);
  });

  it('findAll forwards the incoming Authorization header', async () => {
    service.findAll.mockResolvedValue([{ id: 1 } as never]);

    await controller.findAll('Bearer abc.def.ghi');

    expect(service.findAll).toHaveBeenCalledWith(
      'Bearer abc.def.ghi',
      undefined,
    );
  });

  it('findById delegates to the proxy service with the parsed id', async () => {
    service.findOne.mockResolvedValue({ id: 5 } as never);

    const result = await controller.findById(5);

    expect(result).toEqual({ id: 5 });
    expect(service.findOne).toHaveBeenCalledWith(5, undefined, undefined);
  });

  it('create delegates to the proxy service with the body', async () => {
    const body = {
      firstName: 'Jimmy',
      lastName: 'Outaly',
      email: 'jimmy@example.com',
      phoneNumber: '0987654321',
      password: 'good_user@123',
    };
    service.create.mockResolvedValue({ id: 1, ...body } as never);

    const result = await controller.create(body);

    expect(result).toEqual({ id: 1, ...body });
    expect(service.create).toHaveBeenCalledWith(body, undefined);
  });

  it('update delegates to the proxy service with the parsed id and body', async () => {
    service.update.mockResolvedValue({ id: 5, firstName: 'New' } as never);

    const result = await controller.update(5, { firstName: 'New' });

    expect(result).toEqual({ id: 5, firstName: 'New' });
    expect(service.update).toHaveBeenCalledWith(
      5,
      { firstName: 'New' },
      undefined,
    );
  });

  it('remove delegates to the proxy service with the parsed id', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove(5);

    expect(service.remove).toHaveBeenCalledWith(5, undefined);
  });
});
