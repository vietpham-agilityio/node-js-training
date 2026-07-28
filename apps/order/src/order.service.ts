import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDTO, UpdateOrderDTO } from './order.dto';
import { ORDER_EVENTS, type OrderProcessedPayload } from '@app/constants';

@Injectable()
export class OrderService {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ClientProxy,
  ) {}

  private orders: Order[] = [];

  createOrder(createOrderInput: CreateOrderDTO): Order {
    const order = {
      ...createOrderInput,
      price: 409999,
      id: Number(`${this.orders.length + 1}`),
      status: OrderStatus.PENDING,
    };

    this.orders.push(order);
    this.inventoryClient.emit(ORDER_EVENTS.ORDER_CREATED, order);

    return order;
  }

  handleOrderProcessed(data: OrderProcessedPayload) {
    const order = this.orders.find((o) => o.id === data.orderId);
    if (order) {
      order.status = data.success
        ? OrderStatus.COMPLETED
        : OrderStatus.CANCELLED;
      console.log('Order status updated:', order, this.orders);
    } else {
      console.log('Order not found');
    }
  }

  findAll(): Order[] {
    return this.orders;
  }

  findOne(id: number): Order {
    const order = this.orders.find((o) => o.id === id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  updateOrder(id: number, updateOrderInput: UpdateOrderDTO): Order {
    const order = this.findOne(id);
    const updatedOrder = { ...order, ...updateOrderInput };

    const index = this.orders.findIndex((o) => o.id === id);
    this.orders[index] = updatedOrder;

    return updatedOrder;
  }

  removeOrder(id: number): Order {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    const [removedOrder] = this.orders.splice(index, 1);
    return removedOrder;
  }
}
