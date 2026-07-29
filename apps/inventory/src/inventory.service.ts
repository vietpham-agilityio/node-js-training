import { ORDER_EVENTS } from '@app/constants';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Order } from '@app/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

const SEED_ITEMS = [
  { name: 'Laptop', quantity: 100 },
  { name: 'Mouse', quantity: 50 },
  { name: 'Keyboard', quantity: 75 },
  { name: 'Monitor', quantity: 0 },
];

@Injectable()
export class InventoryService implements OnModuleInit {
  constructor(
    @Inject('ORDER_SERVICE') private orderClient: ClientProxy,
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.inventoryRepository.count();
    if (count === 0) {
      await this.inventoryRepository.save(
        this.inventoryRepository.create(SEED_ITEMS),
      );
    }
  }

  async handleOrderCreated(order: Order) {
    let success = false;
    let message = '';

    const item = await this.inventoryRepository.findOne({
      where: { id: order.productId },
    });

    if (item) {
      if (item.quantity < order.quantity) {
        message = 'Insufficient quantity in inventory';
      } else {
        item.quantity -= order.quantity;
        await this.inventoryRepository.save(item);
        success = true;
        message = 'Order processed successfully';
      }
    } else {
      message = `Product ${order.id} not found in
        inventory`;
    }

    const payload = {
      success,
      message,
      orderId: order.id,
    };

    console.log('Order processed with the payload:', payload);

    return this.orderClient.emit(ORDER_EVENTS.ORDER_PROCESSED, payload);
  }
}
