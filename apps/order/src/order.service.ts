import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

// ORM
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Libs
import {
  ORDER_EVENTS,
  OrderStatus,
  type OrderProcessedPayload,
} from '@app/constants';

// Module
import { Order } from './order.entity';
import { CreateOrderDTO, UpdateOrderDTO } from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ClientProxy,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async createOrder(createOrderInput: CreateOrderDTO): Promise<Order> {
    const order = this.orderRepository.create({
      ...createOrderInput,
      price: 409999,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);
    this.inventoryClient.emit(ORDER_EVENTS.ORDER_CREATED, savedOrder);

    return savedOrder;
  }

  async handleOrderProcessed(data: OrderProcessedPayload): Promise<void> {
    const order = await this.orderRepository.findOneBy({ id: data.orderId });
    if (order) {
      order.status = data.success
        ? OrderStatus.COMPLETED
        : OrderStatus.CANCELLED;
      await this.orderRepository.save(order);
      console.log('Order status updated:', order);
    } else {
      console.log('Order not found');
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async updateOrder(
    id: number,
    updateOrderInput: UpdateOrderDTO,
  ): Promise<Order> {
    const order = await this.findOne(id);
    const updatedOrder = this.orderRepository.merge(order, updateOrderInput);

    return this.orderRepository.save(updatedOrder);
  }

  async removeOrder(id: number): Promise<Order> {
    const order = await this.findOne(id);
    await this.orderRepository.delete(id);

    return order;
  }
}
