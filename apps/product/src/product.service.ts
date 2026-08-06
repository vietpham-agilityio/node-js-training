import { Inject, Injectable, NotFoundException } from '@nestjs/common';

// ORM
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Cache
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// Module
import { ProductEntity } from './product.entity';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';

export const PRODUCT_LIST_CACHE_KEY = 'products:all';
export const productCacheKey = (id: number | string) => `products:${id}`;

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async create(dto: CreateProductDTO): Promise<ProductEntity> {
    const product = this.productRepository.create(dto);
    const saved = await this.productRepository.save(product);
    await this.cache.del(PRODUCT_LIST_CACHE_KEY);

    return saved;
  }

  async findAll(): Promise<ProductEntity[]> {
    return this.productRepository.find();
  }

  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(id: number, dto: UpdateProductDTO): Promise<ProductEntity> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    const saved = await this.productRepository.save(product);
    await this.invalidate(id);

    return saved;
  }

  async remove(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    await this.invalidate(id);
  }

  private async invalidate(id: number): Promise<void> {
    await this.cache.mdel([PRODUCT_LIST_CACHE_KEY, productCacheKey(id)]);
  }
}
