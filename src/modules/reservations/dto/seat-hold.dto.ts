import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

import { SeatHoldStatus } from '../enums/seat-hold-status.enum';

export class CreateSeatHoldDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  seatIds!: string[];
}

export class SeatHoldResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  seatId!: string;

  @ApiProperty()
  seatLabel!: string;

  @ApiProperty()
  showtimeId!: string;

  @ApiProperty({ enum: SeatHoldStatus })
  status!: SeatHoldStatus;

  @ApiProperty()
  heldUntil!: Date;
}

export class HoldSeatsResponseDto {
  @ApiProperty({ type: [SeatHoldResponseDto] })
  holds!: SeatHoldResponseDto[];
}
