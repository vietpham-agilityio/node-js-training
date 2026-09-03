import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Not } from 'typeorm';

import { BaseAbstractService } from '../../common/base/base-crud.service';
import type { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import type { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/exceptions/error-codes';
import type { CreateGenreDto, UpdateGenreDto } from './dto/genre.dto';
import { Genre } from './entities/genre.entity';
import { MovieGenre } from './entities/movie-genre.entity';

@Injectable()
export class GenresService extends BaseAbstractService<Genre> {
  constructor(
    @InjectRepository(Genre) repository: Repository<Genre>,
    @InjectRepository(MovieGenre)
    private readonly movieGenreRepository: Repository<MovieGenre>,
  ) {
    super(repository, 'Genre');
  }

  findAllGenres(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Genre>> {
    return this.findAll(query);
  }

  async createGenre(dto: CreateGenreDto): Promise<Genre> {
    await this.validateGenreName(dto.name);
    return this.create(dto);
  }

  async updateGenre(id: string, dto: UpdateGenreDto): Promise<Genre> {
    await this.validateGenreName(dto.name, id);
    return this.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const inUse = await this.movieGenreRepository.count({
      where: { genreId: id },
    });

    if (inUse > 0) {
      throw new AppException(
        ErrorCode.GENRE_IN_USE,
        'Genre is still assigned to at least one movie',
        HttpStatus.CONFLICT,
      );
    }

    await this.repository.delete(id);
  }

  private async validateGenreName(
    name: string,
    excludingId?: string,
  ): Promise<void> {
    const existing = await this.repository.findOne({
      where: excludingId ? { name, id: Not(excludingId) } : { name },
    });

    if (existing) {
      throw new AppException(
        ErrorCode.GENRE_NAME_ALREADY_EXISTS,
        `Genre name "${name}" is already in use`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
