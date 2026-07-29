import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@app/common';
import { InventoryProxyService } from './inventory-proxy.service';
import { IsInt, Min } from 'class-validator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiProperty,
} from '@nestjs/swagger';

export class UpdateStockDTO {
  @ApiProperty({
    description: 'New absolute stock quantity for the product',
    example: 25,
  })
  @IsInt()
  @Min(0)
  quantity!: number;
}

export class InventoryItemResponseDTO {
  @ApiProperty({ description: 'Inventory item id', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Product name', example: 'Laptop' })
  name!: string;

  @ApiProperty({ description: 'Current stock quantity', example: 25 })
  quantity!: number;
}

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryProxyController {
  constructor(private readonly inventoryProxyService: InventoryProxyService) {}

  @ApiOperation({ summary: 'Update stock quantity for a product' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'productId',
    description: 'ID of the product to update stock for',
    example: 1,
  })
  @ApiBody({ type: UpdateStockDTO })
  @ApiOkResponse({
    description: 'Stock updated successfully',
    type: InventoryItemResponseDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @Patch(':productId/stock')
  @UseGuards(AuthGuard)
  updateStock(
    @Param('productId', ParseIntPipe) productId: number,
    @Body(new ValidationPipe()) body: UpdateStockDTO,
  ) {
    return this.inventoryProxyService.updateStock(productId, body.quantity);
  }
}
