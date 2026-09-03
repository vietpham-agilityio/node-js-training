import { ApiProperty } from '@nestjs/swagger';

import { HallType } from '../enums/hall-type.enum';

export class HallResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: HallType })
  hallType!: HallType;

  // DDR-003: capacity is counted from the seat rows, never stored on the hall.
  @ApiProperty({ description: 'Count of active seats in the hall' })
  totalSeats!: number;
}
