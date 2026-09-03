import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { SortOrder } from '../../../common/enums/sort-order.enum';
import { ReservationStatus } from '../../reservations/enums/reservation-status.enum';
import { ShowtimeStatus } from '../../showtimes/enums/showtime-status.enum';
import { CapacityReportSortField } from '../enums/capacity-report-sort-field.enum';
import { ReservationsReportSortField } from '../enums/reservations-report-sort-field.enum';
import { RevenueReportSortField } from '../enums/revenue-report-sort-field.enum';

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

  @ApiPropertyOptional({
    enum: RevenueReportSortField,
    default: RevenueReportSortField.SHOW_DATE,
  })
  @IsOptional()
  @IsEnum(RevenueReportSortField)
  sortBy: RevenueReportSortField = RevenueReportSortField.SHOW_DATE;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.DESC;
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

  @ApiPropertyOptional({
    enum: CapacityReportSortField,
    default: CapacityReportSortField.SHOW_DATE,
  })
  @IsOptional()
  @IsEnum(CapacityReportSortField)
  sortBy: CapacityReportSortField = CapacityReportSortField.SHOW_DATE;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.ASC;
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

  @ApiPropertyOptional({
    enum: ReservationsReportSortField,
    default: ReservationsReportSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ReservationsReportSortField)
  sortBy: ReservationsReportSortField = ReservationsReportSortField.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.DESC;
}
