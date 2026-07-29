import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDTO, UpdateOrderDTO } from './order.dto';
import { Order } from './order.entity';
import { EventPattern } from '@nestjs/microservices';
import { ORDER_EVENTS, type OrderProcessedPayload } from '@app/constants';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @EventPattern(ORDER_EVENTS.ORDER_PROCESSED)
  handleOrderCreated(data: OrderProcessedPayload) {
    this.orderService.handleOrderProcessed(data);
  }

  @Post()
  createOrder(
    @Body(new ValidationPipe()) createOrderInput: CreateOrderDTO,
  ): Order {
    return this.orderService.createOrder(createOrderInput);
  }

  @Get()
  findAll(): Order[] {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Order {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateOrderInput: UpdateOrderDTO,
  ): Order {
    return this.orderService.updateOrder(id, updateOrderInput);
  }

  @Delete(':id')
  removeOrder(@Param('id', ParseIntPipe) id: number): Order {
    return this.orderService.removeOrder(id);
  }
}
