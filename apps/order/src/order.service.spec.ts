import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './order.entity';
import { ORDER_EVENTS, OrderStatus } from '@app/constants';

describe('OrderService', () => {
  let service: OrderService;
  let inventoryClient: { emit: jest.Mock };
  let mockRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    merge: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    inventoryClient = { emit: jest.fn() };
    mockRepository = {
      create: jest.fn((input: Partial<Order>) => input),
      save: jest.fn((order: Partial<Order>) =>
        Promise.resolve({ id: 1, ...order }),
      ),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      merge: jest.fn((order: Partial<Order>, input: Partial<Order>) => ({
        ...order,
        ...input,
      })),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: 'INVENTORY_SERVICE', useValue: inventoryClient },
        { provide: getRepositoryToken(Order), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('persists the order as Pending and emits ORDER_CREATED', async () => {
      const result = await service.createOrder({
        name: 'Order Camera',
        productId: 12,
        quantity: 2,
      });

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Order Camera',
        productId: 12,
        quantity: 2,
        price: 409999,
        status: OrderStatus.PENDING,
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: 1,
        name: 'Order Camera',
        status: OrderStatus.PENDING,
      });
      expect(inventoryClient.emit).toHaveBeenCalledWith(
        ORDER_EVENTS.ORDER_CREATED,
        result,
      );
    });
  });

  describe('handleOrderProcessed', () => {
    it('marks the order Completed when processing succeeded', async () => {
      const order = { id: 1, status: OrderStatus.PENDING } as Order;
      mockRepository.findOneBy.mockResolvedValue(order);

      await service.handleOrderProcessed({
        orderId: 1,
        success: true,
        message: 'ok',
      });

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, status: OrderStatus.COMPLETED }),
      );
    });

    it('marks the order Cancelled when processing failed', async () => {
      const order = { id: 1, status: OrderStatus.PENDING } as Order;
      mockRepository.findOneBy.mockResolvedValue(order);

      await service.handleOrderProcessed({
        orderId: 1,
        success: false,
        message: 'insufficient stock',
      });

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, status: OrderStatus.CANCELLED }),
      );
    });

    it('does nothing when the order cannot be found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await service.handleOrderProcessed({
        orderId: 999,
        success: true,
        message: 'ok',
      });

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns every order from the repository', async () => {
      const orders = [{ id: 1 }, { id: 2 }] as Order[];
      mockRepository.find.mockResolvedValue(orders);

      await expect(service.findAll()).resolves.toEqual(orders);
    });
  });

  describe('findOne', () => {
    it('returns the order when found', async () => {
      const order = { id: 1 } as Order;
      mockRepository.findOne.mockResolvedValue(order);

      await expect(service.findOne(1)).resolves.toEqual(order);
    });

    it('throws NotFoundException when the order does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOrder', () => {
    it('merges the update input into the existing order and saves it', async () => {
      const order = { id: 1, quantity: 2 } as Order;
      mockRepository.findOne.mockResolvedValue(order);
      mockRepository.save.mockResolvedValue({ id: 1, quantity: 5 });

      const result = await service.updateOrder(1, { quantity: 5 });

      expect(mockRepository.merge).toHaveBeenCalledWith(order, {
        quantity: 5,
      });
      expect(result).toEqual({ id: 1, quantity: 5 });
    });

    it('throws NotFoundException when the order does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateOrder(999, { quantity: 5 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeOrder', () => {
    it('deletes the order and returns it', async () => {
      const order = { id: 1 } as Order;
      mockRepository.findOne.mockResolvedValue(order);

      const result = await service.removeOrder(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(order);
    });

    it('throws NotFoundException when the order does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.removeOrder(999)).rejects.toThrow(NotFoundException);
    });
  });
});
