import { Controller, UseFilters } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';

// Libs
import { RpcErrorFilter } from '@app/common';
import {
  type Order,
  ORDER_EVENTS,
  INVENTORY_MESSAGES,
  type UpdateStockPayload,
} from '@app/constants';

// Module
import { InventoryService } from './inventory.service';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @EventPattern(ORDER_EVENTS.ORDER_CREATED)
  handleOrderCreated(data: Order) {
    this.inventoryService.handleOrderCreated(data);
  }

  @UseFilters(new RpcErrorFilter())
  @MessagePattern(INVENTORY_MESSAGES.UPDATE_STOCK)
  handleUpdateStock(data: UpdateStockPayload) {
    return this.inventoryService.updateStock(data.productId, data.quantity);
  }
}
