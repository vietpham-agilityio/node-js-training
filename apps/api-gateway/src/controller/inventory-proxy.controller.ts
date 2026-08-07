import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { LazyModuleLoader } from '@nestjs/core';
import { IsInt, Min } from 'class-validator';

// Docs
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

// Libs
import { AuthGuard, RolesGuard, Roles } from '@app/common';
import { USER_ROLE } from '@app/constants';

// Module
import { InventoryProxyService } from '../services';
import { InventoryProxyModule } from '../modules';

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
  private inventoryProxyServicePromise?: Promise<InventoryProxyService>;

  constructor(private readonly lazyModuleLoader: LazyModuleLoader) {}

  private getInventoryProxyService(): Promise<InventoryProxyService> {
    if (!this.inventoryProxyServicePromise) {
      this.inventoryProxyServicePromise = this.lazyModuleLoader
        .load(() => InventoryProxyModule)
        .then((moduleRef) =>
          moduleRef.get(InventoryProxyService, { strict: false }),
        );
    }
    return this.inventoryProxyServicePromise;
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(USER_ROLE.MERCHANT)
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
  async updateStock(
    @Param('productId', ParseIntPipe) productId: number,
    @Body(new ValidationPipe()) body: UpdateStockDTO,
  ) {
    const inventoryProxyService = await this.getInventoryProxyService();
    return inventoryProxyService.updateStock(productId, body.quantity);
  }
}
