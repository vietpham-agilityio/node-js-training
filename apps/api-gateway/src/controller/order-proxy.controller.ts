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
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { OrderProxyService } from '../services';
import { CreateOrderDTO, UpdateOrderDTO } from 'apps/order/src/order.dto';
import { Order } from 'apps/order/src/order.entity';

@ApiTags('Orders')
@Controller('orders')
export class ProxyController {
  constructor(private readonly orderProxyService: OrderProxyService) {}

  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDTO })
  @ApiCreatedResponse({
    description: 'Order created successfully',
    type: Order,
  })
  @Post()
  createOrder(@Body() body: unknown) {
    return this.orderProxyService.createOrder(body as CreateOrderDTO);
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiOkResponse({
    description: 'List of orders returned successfully',
    type: [Order],
  })
  @Get()
  findAll() {
    return this.orderProxyService.findAll();
  }

  @ApiOperation({ summary: 'Get an order by id' })
  @ApiParam({ name: 'id', description: 'ID of the order to fetch', example: 1 })
  @ApiOkResponse({ description: 'Order returned successfully', type: Order })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderProxyService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an existing order' })
  @ApiParam({ name: 'id', description: 'ID of the order to update', example: 1 })
  @ApiBody({ type: UpdateOrderDTO })
  @ApiOkResponse({ description: 'Order updated successfully', type: Order })
  @Patch(':id')
  updateOrder(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    return this.orderProxyService.updateOrder(id, body as UpdateOrderDTO);
  }

  @ApiOperation({ summary: 'Delete an order' })
  @ApiParam({ name: 'id', description: 'ID of the order to delete', example: 1 })
  @ApiOkResponse({ description: 'Order deleted successfully', type: Order })
  @Delete(':id')
  removeOrder(@Param('id', ParseIntPipe) id: number) {
    return this.orderProxyService.removeOrder(id);
  }
}
