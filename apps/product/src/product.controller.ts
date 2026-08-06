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
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';

// Docs
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

// Cache
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';

// Libs
import { AuthGuard, RolesGuard, Roles } from '@app/common';
import { USER_ROLE } from '@app/constants';

// Module
import {
  ProductService,
  PRODUCT_LIST_CACHE_KEY,
  productCacheKey,
} from './product.service';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';
import { ProductEntity } from './product.entity';

@ApiTags('Products')
@Controller('products')
@UseGuards(AuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  @Roles(USER_ROLE.ADMIN)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, type: ProductEntity })
  create(@Body(new ValidationPipe()) dto: CreateProductDTO) {
    return this.productService.create(dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey(PRODUCT_LIST_CACHE_KEY)
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, type: [ProductEntity] })
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheKey((ctx) => productCacheKey(ctx.switchToHttp().getRequest().params.id))
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({ status: 200, type: ProductEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @Roles(USER_ROLE.ADMIN)
  @ApiOperation({ summary: 'Update a product by id' })
  @ApiResponse({ status: 200, type: ProductEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) dto: UpdateProductDTO,
  ) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @Roles(USER_ROLE.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product by id' })
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
