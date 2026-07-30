import { Test, TestingModule } from '@nestjs/testing';
import { ProductProxyController } from '../controller';
import { ProductProxyService } from '../services';

describe('ProductProxyController', () => {
  let controller: ProductProxyController;
  let service: jest.Mocked<ProductProxyService>;

  beforeEach(async () => {
    const mockProductProxyService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductProxyController],
      providers: [
        { provide: ProductProxyService, useValue: mockProductProxyService },
      ],
    }).compile();

    controller = module.get<ProductProxyController>(ProductProxyController);
    service = module.get(ProductProxyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('findAll delegates to the proxy service', async () => {
    service.findAll.mockResolvedValue([{ id: 1 } as never]);

    const result = await controller.findAll();

    expect(result).toEqual([{ id: 1 }]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne delegates to the proxy service with the parsed id', async () => {
    service.findOne.mockResolvedValue({ id: 5 } as never);

    const result = await controller.findOne(5);

    expect(result).toEqual({ id: 5 });
    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('create delegates to the proxy service with the dto', async () => {
    const dto = {
      name: 'Sony Camera',
      description: 'Modern camera in future',
      price: 49000000,
      quantity: 100,
    };
    service.create.mockResolvedValue({ id: 1, ...dto } as never);

    const result = await controller.create(dto);

    expect(result).toEqual({ id: 1, ...dto });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update delegates to the proxy service with the parsed id and dto', async () => {
    service.update.mockResolvedValue({ id: 5, quantity: 2 } as never);

    const result = await controller.update(5, { quantity: 2 });

    expect(result).toEqual({ id: 5, quantity: 2 });
    expect(service.update).toHaveBeenCalledWith(5, { quantity: 2 });
  });

  it('remove delegates to the proxy service with the parsed id', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove(5);

    expect(service.remove).toHaveBeenCalledWith(5);
  });
});
