import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { OrderStatus } from '@app/constants';
import { Order } from 'apps/order/src/order.entity';
import { ProxyController } from '..';
import { OrderProxyService } from '../../services';

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
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
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
    expect(service.createOrder).toHaveBeenCalledWith(
      {
        name: 'Order Camera',
        productId: 12,
        quantity: 2,
      },
      undefined,
    );
  });

  it('findAll delegates to the proxy service', async () => {
    service.findAll.mockResolvedValue([mockOrder]);

    const result = await controller.findAll();

    expect(result).toEqual([mockOrder]);
    expect(service.findAll).toHaveBeenCalledWith(undefined);
  });

  it('findAll forwards the incoming Authorization header', async () => {
    service.findAll.mockResolvedValue([mockOrder]);

    await controller.findAll('Bearer abc.def.ghi');

    expect(service.findAll).toHaveBeenCalledWith('Bearer abc.def.ghi');
  });

  it('findOne delegates with the parsed numeric id', async () => {
    service.findOne.mockResolvedValue(mockOrder);

    const result = await controller.findOne(5);

    expect(result).toEqual(mockOrder);
    expect(service.findOne).toHaveBeenCalledWith(5, undefined);
  });

  it('updateOrder delegates with id and body', async () => {
    service.updateOrder.mockResolvedValue(mockOrder);

    const result = await controller.updateOrder(5, { quantity: 2 });

    expect(result).toEqual(mockOrder);
    expect(service.updateOrder).toHaveBeenCalledWith(5, { quantity: 2 }, undefined);
  });

  it('removeOrder delegates with the parsed numeric id', async () => {
    service.removeOrder.mockResolvedValue(mockOrder);

    const result = await controller.removeOrder(5);

    expect(result).toEqual(mockOrder);
    expect(service.removeOrder).toHaveBeenCalledWith(5, undefined);
  });
});
