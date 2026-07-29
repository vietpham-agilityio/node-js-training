import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@app/constants';
import { Order } from 'apps/order/src/order.entity';
import { ProxyController } from './proxy.controller';
import { OrderProxyService } from './order-proxy.service';

const mockOrder: Order = {
  id: 1,
  name: 'Order Camera',
  productId: 12,
  price: 409999,
  status: OrderStatus.PENDING,
  quantity: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProxyController', () => {
  let controller: ProxyController;
  let service: jest.Mocked<OrderProxyService>;

  beforeEach(async () => {
    const mockOrderProxyService = {
      createOrder: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      updateOrder: jest.fn(),
      removeOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProxyController],
      providers: [
        { provide: OrderProxyService, useValue: mockOrderProxyService },
      ],
    }).compile();

    controller = module.get<ProxyController>(ProxyController);
    service = module.get(OrderProxyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('createOrder delegates to the proxy service with the request body', async () => {
    service.createOrder.mockResolvedValue(mockOrder);

    const result = await controller.createOrder({
      name: 'Order Camera',
      productId: 12,
      quantity: 2,
    });

    expect(result).toEqual(mockOrder);
    expect(service.createOrder).toHaveBeenCalledWith({
      name: 'Order Camera',
      productId: 12,
      quantity: 2,
    });
  });

  it('findAll delegates to the proxy service', async () => {
    service.findAll.mockResolvedValue([mockOrder]);

    const result = await controller.findAll();

    expect(result).toEqual([mockOrder]);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne delegates with the parsed numeric id', async () => {
    service.findOne.mockResolvedValue(mockOrder);

    const result = await controller.findOne(5);

    expect(result).toEqual(mockOrder);
    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('updateOrder delegates with id and body', async () => {
    service.updateOrder.mockResolvedValue(mockOrder);

    const result = await controller.updateOrder(5, { quantity: 2 });

    expect(result).toEqual(mockOrder);
    expect(service.updateOrder).toHaveBeenCalledWith(5, { quantity: 2 });
  });

  it('removeOrder delegates with the parsed numeric id', async () => {
    service.removeOrder.mockResolvedValue(mockOrder);

    const result = await controller.removeOrder(5);

    expect(result).toEqual(mockOrder);
    expect(service.removeOrder).toHaveBeenCalledWith(5);
  });
});
