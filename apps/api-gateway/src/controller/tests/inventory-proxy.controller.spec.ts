import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LazyModuleLoader } from '@nestjs/core';
import { InventoryProxyController } from '..';

describe('InventoryProxyController', () => {
  let controller: InventoryProxyController;
  let mockInventoryProxyService: { updateStock: jest.Mock };
  let mockLazyModuleLoader: { load: jest.Mock };

  beforeEach(async () => {
    mockInventoryProxyService = {
      updateStock: jest.fn(),
    };

    mockLazyModuleLoader = {
      load: jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue(mockInventoryProxyService),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryProxyController],
      providers: [
        { provide: LazyModuleLoader, useValue: mockLazyModuleLoader },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
      ],
    }).compile();

    controller = module.get<InventoryProxyController>(InventoryProxyController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('updateStock delegates to the proxy service with the parsed id and quantity', async () => {
    mockInventoryProxyService.updateStock.mockResolvedValue({
      id: 1,
      name: 'Laptop',
      quantity: 25,
    });

    const result = await controller.updateStock(1, { quantity: 25 });

    expect(result).toEqual({ id: 1, name: 'Laptop', quantity: 25 });
    expect(mockInventoryProxyService.updateStock).toHaveBeenCalledWith(1, 25);
  });

  it('loads the lazy inventory proxy module only once across multiple calls', async () => {
    mockInventoryProxyService.updateStock.mockResolvedValue({
      id: 1,
      name: 'Laptop',
      quantity: 25,
    });

    await controller.updateStock(1, { quantity: 25 });
    await controller.updateStock(1, { quantity: 30 });

    expect(mockLazyModuleLoader.load).toHaveBeenCalledTimes(1);
  });
});
