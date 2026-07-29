import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './order.entity';

describe('OrderController', () => {
  let orderController: OrderController;

  beforeEach(async () => {
    const mockOrderRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        OrderService,
        { provide: 'INVENTORY_SERVICE', useValue: { emit: jest.fn() } },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
      ],
    }).compile();

    orderController = app.get<OrderController>(OrderController);
  });

  describe('findAll', () => {
    it('should return an empty array when no orders exist', async () => {
      await expect(orderController.findAll()).resolves.toEqual([]);
    });
  });
});
