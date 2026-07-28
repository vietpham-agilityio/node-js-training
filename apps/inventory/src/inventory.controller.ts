import { Controller, Get } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { EventPattern } from '@nestjs/microservices';
import { type Order, ORDER_EVENTS } from '@app/constants';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @EventPattern(ORDER_EVENTS.ORDER_CREATED)
  handleOrderCreated(data: Order) {
    this.inventoryService.handleOrderCreated(data);
  }

  @Get('health')
  checkHealth() {
    return { status: 'UP' };
  }
}
