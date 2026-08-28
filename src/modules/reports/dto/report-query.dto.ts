import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ReservationStatus } from '../../reservations/enums/reservation-status.enum';
import { ShowtimeStatus } from '../../showtimes/enums/showtime-status.enum';

export class RevenueReportQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Inclusive start show date, YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Inclusive end show date, YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  movieId?: string;
}

export class CapacityReportQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Inclusive start show date, YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Inclusive end show date, YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  hallId?: string;

  @ApiPropertyOptional({ enum: ShowtimeStatus })
  @IsOptional()
  @IsEnum(ShowtimeStatus)
  status?: ShowtimeStatus;
}

export class ReservationsReportQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Inclusive start show date, YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Inclusive end show date, YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: ReservationStatus })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
