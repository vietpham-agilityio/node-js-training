import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

// Docs
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';

// Libs
import { AuthGuard } from '@app/common';

// Module
import { OrderProxyService } from '../services';
import { CreateOrderDTO, UpdateOrderDTO } from 'apps/order/src/order.dto';
import { Order } from 'apps/order/src/order.entity';

@ApiTags('Orders')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Missing or invalid authentication token',
})
@Controller('orders')
@UseGuards(AuthGuard)
export class ProxyController {
  constructor(private readonly orderProxyService: OrderProxyService) {}

  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDTO })
  @ApiCreatedResponse({
    description: 'Order created successfully',
    type: Order,
  })
  @Post()
  createOrder(
    @Body() body: unknown,
    @Headers('authorization') authorization?: string,
  ) {
    return this.orderProxyService.createOrder(
      body as CreateOrderDTO,
      authorization,
    );
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiOkResponse({
    description: 'List of orders returned successfully',
    type: [Order],
  })
  @Get()
  findAll(@Headers('authorization') authorization?: string) {
    return this.orderProxyService.findAll(authorization);
  }

  @ApiOperation({ summary: 'Get an order by id' })
  @ApiParam({ name: 'id', description: 'ID of the order to fetch', example: 1 })
  @ApiOkResponse({ description: 'Order returned successfully', type: Order })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') authorization?: string,
  ) {
    return this.orderProxyService.findOne(id, authorization);
  }

  @ApiOperation({ summary: 'Update an existing order' })
  @ApiParam({ name: 'id', description: 'ID of the order to update', example: 1 })
  @ApiBody({ type: UpdateOrderDTO })
  @ApiOkResponse({ description: 'Order updated successfully', type: Order })
  @Patch(':id')
  updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: unknown,
    @Headers('authorization') authorization?: string,
  ) {
    return this.orderProxyService.updateOrder(
      id,
      body as UpdateOrderDTO,
      authorization,
    );
  }

  @ApiOperation({ summary: 'Delete an order' })
  @ApiParam({ name: 'id', description: 'ID of the order to delete', example: 1 })
  @ApiOkResponse({ description: 'Order deleted successfully', type: Order })
  @Delete(':id')
  removeOrder(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') authorization?: string,
  ) {
    return this.orderProxyService.removeOrder(id, authorization);
  }
}
