import { Controller, Get } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import {
  type Order,
  ORDER_EVENTS,
  INVENTORY_MESSAGES,
  type UpdateStockPayload,
} from '@app/constants';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @EventPattern(ORDER_EVENTS.ORDER_CREATED)
  handleOrderCreated(data: Order) {
    this.inventoryService.handleOrderCreated(data);
  }

  @MessagePattern(INVENTORY_MESSAGES.UPDATE_STOCK)
  handleUpdateStock(data: UpdateStockPayload) {
    return this.inventoryService.updateStock(data.productId, data.quantity);
  }

  @Get('health')
  checkHealth() {
    return { status: 'UP' };
  }
}
