import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ORDER_EVENTS, type Order, OrderStatus } from '@app/constants';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './inventory-item.entity';

describe('InventoryService', () => {
  let service: InventoryService;
  let orderClient: { emit: jest.Mock };
  let mockRepository: {
    count: jest.Mock;
    create: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
  };

  const mockOrder = (overrides: Partial<Order> = {}): Order => ({
    id: 1,
    name: 'Order Camera',
    productId: 1,
    price: 409999,
    status: OrderStatus.PENDING,
    quantity: 10,
    ...overrides,
  });

  beforeEach(async () => {
    orderClient = { emit: jest.fn() };
    mockRepository = {
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn((items) => items),
      findOne: jest.fn(),
      save: jest.fn((item: InventoryItem) => Promise.resolve(item)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: 'ORDER_SERVICE', useValue: orderClient },
        {
          provide: getRepositoryToken(InventoryItem),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('seeds the default items when the table is empty', async () => {
      mockRepository.count.mockResolvedValue(0);

      await service.onModuleInit();

      expect(mockRepository.create).toHaveBeenCalledWith([
        { name: 'Laptop', quantity: 100 },
        { name: 'Mouse', quantity: 50 },
        { name: 'Keyboard', quantity: 75 },
        { name: 'Monitor', quantity: 0 },
      ]);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('does not seed when items already exist', async () => {
      mockRepository.count.mockResolvedValue(4);

      await service.onModuleInit();

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('handleOrderCreated', () => {
    it('decrements stock and emits a successful ORDER_PROCESSED payload', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Laptop',
        quantity: 20,
      });

      await service.handleOrderCreated(mockOrder({ id: 5, quantity: 5 }));

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, quantity: 15 }),
      );
      expect(orderClient.emit).toHaveBeenCalledWith(
        ORDER_EVENTS.ORDER_PROCESSED,
        {
          success: true,
          message: 'Order processed successfully',
          orderId: 5,
        },
      );
    });

    it('emits a failed ORDER_PROCESSED payload without saving when stock is insufficient', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Laptop',
        quantity: 2,
      });

      await service.handleOrderCreated(mockOrder({ id: 6, quantity: 5 }));

      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(orderClient.emit).toHaveBeenCalledWith(
        ORDER_EVENTS.ORDER_PROCESSED,
        {
          success: false,
          message: 'Insufficient quantity in inventory',
          orderId: 6,
        },
      );
    });

    it('emits a failed ORDER_PROCESSED payload when the product is not in inventory', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await service.handleOrderCreated(
        mockOrder({ id: 7, productId: 999, quantity: 1 }),
      );

      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(orderClient.emit).toHaveBeenCalledWith(
        ORDER_EVENTS.ORDER_PROCESSED,
        expect.objectContaining({ success: false, orderId: 7 }),
      );
    });
  });

  describe('updateStock', () => {
    it('updates the quantity of an existing item', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Laptop',
        quantity: 100,
      });

      const result = await service.updateStock(1, 25);

      expect(result.quantity).toBe(25);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, quantity: 25 }),
      );
    });

    it('throws NotFoundException when the product does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStock(999, 10)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
