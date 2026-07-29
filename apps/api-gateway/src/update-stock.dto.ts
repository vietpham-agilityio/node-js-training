import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockDTO {
  @ApiProperty({
    description: 'New absolute stock quantity for the product',
    example: 25,
  })
  @IsInt()
  @Min(0)
  quantity!: number;
}
