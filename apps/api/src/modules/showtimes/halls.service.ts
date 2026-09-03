import { Injectable, MethodNotAllowedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseAbstractService } from '../../common/base/base-crud.service';
import { HallResponseDto } from './dto/hall.dto';
import { Hall } from './entities/hall.entity';
import { HallType } from './enums/hall-type.enum';

@Injectable()
export class HallsService extends BaseAbstractService<Hall> {
  constructor(
    @InjectRepository(Hall)
    repository: Repository<Hall>,
  ) {
    super(repository, 'Hall');
  }

  // Not paginated: a cinema has a handful of halls, and the caller needs all
  // of them at once to make sense of a showtime listing.
  async findAllHalls(): Promise<HallResponseDto[]> {
    const rows = await this.repository
      .createQueryBuilder('hall')
      .leftJoin('hall.seats', 'seat', 'seat.isActive = true')
      .select('hall.id', 'id')
      .addSelect('hall.name', 'name')
      .addSelect('hall.hallType', 'hallType')
      .addSelect('COUNT(seat.id)', 'totalSeats')
      .where('hall.isActive = true')
      .groupBy('hall.id')
      .orderBy('hall.name', 'ASC')
      .getRawMany<{
        id: string;
        name: string;
        hallType: HallType;
        totalSeats: string;
      }>();

    // COUNT comes back from pg as a string; Number() keeps the DTO honest.
    return rows.map(({ totalSeats, ...hall }) => ({
      ...hall,
      totalSeats: Number(totalSeats),
    }));
  }

  // Implements BaseAbstractService's abstract remove(). Halls expose no
  // mutation route (DDR-015), so reaching this is a routing bug, not a
  // business failure — fail loudly rather than silently retiring a hall
  // that showtimes still reference.
  remove(): Promise<void> {
    throw new MethodNotAllowedException('Halls are read-only');
  }
}
