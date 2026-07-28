import { ORDER_EVENTS } from '@app/constants';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Order } from '@app/constants';

@Injectable()
export class InventoryService {
  constructor(@Inject('ORDER_SERVICE') private orderClient: ClientProxy) {}

  private inventory = [
    { id: 1, name: 'Laptop', quantity: 100 },
    { id: 2, name: 'Mouse', quantity: 50 },
    { id: 3, name: 'Keyboard', quantity: 75 },
    { id: 4, name: 'Monitor', quantity: 0 },
  ];

  handleOrderCreated(order: Order) {
    let success = false;
    let message = '';

    const item = this.inventory.find((i) => i.id === order.productId);
    if (item) {
      if (item.quantity < order.quantity) {
        message = 'Insufficient quantity in inventory';
      } else {
        item.quantity -= order.quantity;
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
