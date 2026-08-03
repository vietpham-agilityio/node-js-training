import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ORDER_EVENTS, type Order, OrderStatus } from '@app/constants';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './inventory-item.entity';

describe('InventoryController', () => {
  let inventoryController: InventoryController;
  let orderClient: { emit: jest.Mock };
  let mockInventoryRepository: {
    count: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

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
    mockInventoryRepository = {
      count: jest.fn().mockResolvedValue(1),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      save: jest.fn((item) => Promise.resolve(item)),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        InventoryService,
        { provide: 'ORDER_SERVICE', useValue: orderClient },
        {
          provide: getRepositoryToken(InventoryItem),
          useValue: mockInventoryRepository,
        },
      ],
    }).compile();

    inventoryController = app.get<InventoryController>(InventoryController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleOrderCreated', () => {
    it('decrements stock and emits a successful ORDER_PROCESSED payload', async () => {
      mockInventoryRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Laptop',
        quantity: 20,
      });

      inventoryController.handleOrderCreated(mockOrder({ id: 5, quantity: 5 }));
      await flushPromises();

      expect(mockInventoryRepository.save).toHaveBeenCalledWith(
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

    it('emits a failed ORDER_PROCESSED payload without saving when the product is not in inventory', async () => {
      mockInventoryRepository.findOne.mockResolvedValue(null);

      inventoryController.handleOrderCreated(
        mockOrder({ id: 7, productId: 999, quantity: 1 }),
      );
      await flushPromises();

      expect(mockInventoryRepository.save).not.toHaveBeenCalled();
      expect(orderClient.emit).toHaveBeenCalledWith(
        ORDER_EVENTS.ORDER_PROCESSED,
        expect.objectContaining({ success: false, orderId: 7 }),
      );
    });
  });

  describe('handleUpdateStock', () => {
    it('updates and returns the inventory item', async () => {
      mockInventoryRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Laptop',
        quantity: 100,
      });

      const result = await inventoryController.handleUpdateStock({
        productId: 1,
        quantity: 25,
      });

      expect(result).toEqual(
        expect.objectContaining({ id: 1, quantity: 25 }),
      );
      expect(mockInventoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, quantity: 25 }),
      );
    });

    it('propagates a NotFoundException when the product does not exist', async () => {
      mockInventoryRepository.findOne.mockResolvedValue(null);

      await expect(
        inventoryController.handleUpdateStock({ productId: 999, quantity: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
