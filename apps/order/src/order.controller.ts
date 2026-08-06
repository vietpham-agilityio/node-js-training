import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

// Libs
import { ORDER_EVENTS, type OrderProcessedPayload } from '@app/constants';
import { AuthGuard } from '@app/common';

// Module
import { OrderService } from './order.service';
import { CreateOrderDTO, UpdateOrderDTO } from './order.dto';
import { Order } from './order.entity';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @EventPattern(ORDER_EVENTS.ORDER_PROCESSED)
  handleOrderCreated(data: OrderProcessedPayload) {
    return this.orderService.handleOrderProcessed(data);
  }

  @Post()
  @UseGuards(AuthGuard)
  createOrder(
    @Body(new ValidationPipe()) createOrderInput: CreateOrderDTO,
  ): Promise<Order> {
    return this.orderService.createOrder(createOrderInput);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateOrderInput: UpdateOrderDTO,
  ): Promise<Order> {
    return this.orderService.updateOrder(id, updateOrderInput);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  removeOrder(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.removeOrder(id);
  }
}
