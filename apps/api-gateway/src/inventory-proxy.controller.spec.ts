import { Test, TestingModule } from '@nestjs/testing';
import { InventoryProxyController } from './inventory-proxy.controller';
import { InventoryProxyService } from './inventory-proxy.service';

describe('InventoryProxyController', () => {
  let controller: InventoryProxyController;
  let service: jest.Mocked<InventoryProxyService>;

  beforeEach(async () => {
    const mockInventoryProxyService = {
      updateStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryProxyController],
      providers: [
        { provide: InventoryProxyService, useValue: mockInventoryProxyService },
      ],
    }).compile();

    controller = module.get<InventoryProxyController>(
      InventoryProxyController,
    );
    service = module.get(InventoryProxyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('updateStock delegates to the proxy service with the parsed id and quantity', async () => {
    service.updateStock.mockResolvedValue({
      id: 1,
      name: 'Laptop',
      quantity: 25,
    });

    const result = await controller.updateStock(1, { quantity: 25 });

    expect(result).toEqual({ id: 1, name: 'Laptop', quantity: 25 });
    expect(service.updateStock).toHaveBeenCalledWith(1, 25);
  });
});
