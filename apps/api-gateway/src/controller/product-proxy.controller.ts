import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ProductProxyService } from '../services/product-proxy.service';
import {
  CreateProductDTO,
  UpdateProductDTO,
} from 'apps/product/src/product.dto';
import { ProductEntity } from 'apps/product/src/product.entity';
import { AuthGuard } from '@app/common';

@ApiTags('Products')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Missing or invalid authentication token',
})
@Controller('products')
@UseGuards(AuthGuard)
export class ProductProxyController {
  constructor(private readonly productProxyService: ProductProxyService) { }

  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDTO })
  @ApiCreatedResponse({
    description: 'Product created successfully',
    type: ProductEntity,
  })
  @Post()
  create(
    @Body(new ValidationPipe()) dto: CreateProductDTO,
    @Headers('authorization') authorization?: string,
  ) {
    return this.productProxyService.create(dto, authorization);
  }

  @ApiOperation({ summary: 'Get all products' })
  @ApiOkResponse({
    description: 'List of products returned successfully',
    type: [ProductEntity],
  })
  @Get()
  findAll(@Headers('authorization') authorization?: string) {
    return this.productProxyService.findAll(authorization);
  }

  @ApiOperation({ summary: 'Get a product by id' })
  @ApiParam({
    name: 'id',
    description: 'ID of the product to fetch',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Product returned successfully',
    type: ProductEntity,
  })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') authorization?: string,
  ) {
    return this.productProxyService.findOne(id, authorization);
  }

  @ApiOperation({ summary: 'Update a product by id' })
  @ApiParam({
    name: 'id',
    description: 'ID of the product to update',
    example: 1,
  })
  @ApiBody({ type: UpdateProductDTO })
  @ApiOkResponse({
    description: 'Product updated successfully',
    type: ProductEntity,
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) dto: UpdateProductDTO,
    @Headers('authorization') authorization?: string,
  ) {
    return this.productProxyService.update(id, dto, authorization);
  }

  @ApiOperation({ summary: 'Delete a product by id' })
  @ApiParam({
    name: 'id',
    description: 'ID of the product to delete',
    example: 1,
  })
  @ApiNoContentResponse({ description: 'Product deleted successfully' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') authorization?: string,
  ) {
    return this.productProxyService.remove(id, authorization);
  }
}
