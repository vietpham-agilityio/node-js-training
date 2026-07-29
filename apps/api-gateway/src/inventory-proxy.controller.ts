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
import { UpdateStockDTO } from './update-stock.dto';

@Controller('inventory')
export class InventoryProxyController {
  constructor(private readonly inventoryProxyService: InventoryProxyService) {}

  @Patch(':productId/stock')
  @UseGuards(AuthGuard)
  updateStock(
    @Param('productId', ParseIntPipe) productId: number,
    @Body(new ValidationPipe()) body: UpdateStockDTO,
  ) {
    return this.inventoryProxyService.updateStock(productId, body.quantity);
  }
}
