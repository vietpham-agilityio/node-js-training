import { IsString, IsNotEmpty, IsInt, IsPositive, Min } from 'class-validator';

// Docs
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateOrderDTO {
  @ApiProperty({
    description: 'Order name',
    example: 'Order Camera',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'ID of the product being ordered',
    example: 12,
  })
  @IsInt()
  @IsPositive()
  productId!: number;

  @ApiProperty({
    description: 'Quantity ordered',
    example: 2,
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class UpdateOrderDTO extends PartialType(CreateOrderDTO) {}
