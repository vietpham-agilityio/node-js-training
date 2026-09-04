import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';

import { PaginationMetaDto } from '../../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { HallType } from '../enums/hall-type.enum';
import { SeatStatus } from '../enums/seat-status.enum';
import { ShowtimeStatus } from '../enums/showtime-status.enum';

// 'HH:mm' or 'HH:mm:ss'. Two-part input is normalized before it reaches the
// database so BR-16's unique index cannot be defeated by format alone.
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

// BR-28: endTime is absent by design — it is computed from the movie's
// duration at write time, so a client cannot contradict the movie it books.
export class CreateShowtimeDto {
  @ApiProperty()
  @IsUUID('4')
  movieId!: string;

  @ApiProperty()
  @IsUUID('4')
  hallId!: string;

  @ApiProperty({ example: '2026-09-01' })
  @IsDateString()
  showDate!: string;

  @ApiProperty({ example: '19:00:00' })
  @Matches(TIME_PATTERN, { message: 'showTime must be HH:mm or HH:mm:ss' })
  showTime!: string;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice!: number;
}

export class UpdateShowtimeDto {
  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsOptional()
  @IsDateString()
  showDate?: string;

  @ApiPropertyOptional({ example: '19:00:00' })
  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'showTime must be HH:mm or HH:mm:ss' })
  showTime?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ enum: ShowtimeStatus })
  @IsOptional()
  @IsEnum(ShowtimeStatus)
  status?: ShowtimeStatus;
}

export class ShowtimeListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Exact show date, YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  movieId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  hallId?: string;
}

export class ShowtimeMovieDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  durationMinutes!: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  posterUrl!: string | null;

  @ApiProperty()
  language!: string;

  @ApiPropertyOptional({ type: Number, nullable: true })
  rating!: number | null;
}

export class ShowtimeHallDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: HallType })
  hallType!: HallType;
}

export class ShowtimeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  movieId!: string;

  @ApiProperty()
  hallId!: string;

  @ApiProperty()
  showDate!: string;

  @ApiProperty()
  showTime!: string;

  @ApiProperty()
  endTime!: string;

  @ApiProperty()
  basePrice!: number;

  @ApiProperty({ enum: ShowtimeStatus })
  status!: ShowtimeStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ type: ShowtimeMovieDto, nullable: true })
  movie!: ShowtimeMovieDto | null;

  @ApiPropertyOptional({ type: ShowtimeHallDto, nullable: true })
  hall!: ShowtimeHallDto | null;

  @ApiProperty()
  totalSeats!: number;

  @ApiProperty()
  seatsTaken!: number;

  @ApiProperty()
  availableSeats!: number;
}

export class PaginatedShowtimeResponseDto {
  @ApiProperty({ type: [ShowtimeResponseDto] })
  data!: ShowtimeResponseDto[];

  @ApiProperty()
  meta!: PaginationMetaDto;
}

export class ShowtimeSeatResponseDto {
  @ApiProperty()
  seatId!: string;

  @ApiProperty()
  seatRow!: string;

  @ApiProperty()
  seatColumn!: number;

  @ApiProperty()
  seatLabel!: string;

  @ApiProperty({ enum: SeatStatus })
  status!: SeatStatus;

  @ApiPropertyOptional()
  isMine?: boolean;
}
