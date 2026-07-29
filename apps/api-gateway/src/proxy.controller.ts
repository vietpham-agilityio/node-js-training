import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { OrderProxyService } from './order-proxy.service';
import type { CreateOrderDTO, UpdateOrderDTO } from 'apps/order/src/order.dto';

@Controller('orders')
export class ProxyController {
  constructor(private readonly orderProxyService: OrderProxyService) {}

  @Post()
  createOrder(@Body() body: unknown) {
    return this.orderProxyService.createOrder(body as CreateOrderDTO);3
  }

  @Get()
  findAll() {
    return this.orderProxyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderProxyService.findOne(id);
  }

  @Patch(':id')
  updateOrder(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    return this.orderProxyService.updateOrder(id, body as UpdateOrderDTO);
  }

  @Delete(':id')
  removeOrder(@Param('id', ParseIntPipe) id: number) {
    return this.orderProxyService.removeOrder(id);
  }
}
