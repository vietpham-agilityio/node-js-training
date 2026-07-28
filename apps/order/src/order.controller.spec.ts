import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

describe('OrderController', () => {
  let orderController: OrderController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        OrderService,
        { provide: 'INVENTORY_SERVICE', useValue: { emit: jest.fn() } },
      ],
    }).compile();

    orderController = app.get<OrderController>(OrderController);
  });

  describe('findAll', () => {
    it('should return an empty array when no orders exist', () => {
      expect(orderController.findAll()).toEqual([]);
    });
  });
});
