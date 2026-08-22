import { NotFoundException } from '@nestjs/common';
import type {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

import type { PaginationQueryDto } from '../dto/pagination-query.dto';
import type { PaginatedResponseDto } from '../dto/paginated-response.dto';

// ADR-001: one abstract class per module, not a cross-module repository.
// `remove` stays abstract — ADR-010 makes deletion entity-specific (an
// `is_active` flag, a `status` transition, or a genuine hard delete), so no
// single default is correct for every entity.
export abstract class BaseAbstractService<
  Entity extends ObjectLiteral & { id: string },
> {
  protected constructor(
    protected readonly repository: Repository<Entity>,
    private readonly entityName: string,
  ) {}

  create(data: DeepPartial<Entity>): Promise<Entity> {
    return this.repository.save(this.repository.create(data));
  }

  async findAll(
    { page, limit, skip }: PaginationQueryDto,
    options?: FindManyOptions<Entity>,
  ): Promise<PaginatedResponseDto<Entity>> {
    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip,
      take: limit,
    });

    return {
      data,
      meta: { page, limit, total, hasMore: skip + data.length < total },
    };
  }

  async findOne(
    id: string,
    options?: Omit<FindOneOptions<Entity>, 'where'>,
  ): Promise<Entity> {
    const entity = await this.repository.findOne({
      ...options,
      where: { id } as FindOptionsWhere<Entity>,
    });

    if (!entity) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found`);
    }

    return entity;
  }

  async update(id: string, data: DeepPartial<Entity>): Promise<Entity> {
    const entity = await this.findOne(id);
    return this.repository.save(this.repository.merge(entity, data));
  }

  abstract remove(id: string): Promise<void>;
}
