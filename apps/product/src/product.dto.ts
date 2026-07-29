import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsPositive,
  Min,
} from 'class-validator';

import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateProductDTO {
  @ApiProperty({
    description: 'Product name',
    example: 'Sony Camera',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Modern camera in future',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Product price (VND)',
    example: 49000000,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 100,
  })
  @IsInt()
  @Min(0)
  quantity!: number;
}

export class UpdateProductDTO extends PartialType(CreateProductDTO) {}
