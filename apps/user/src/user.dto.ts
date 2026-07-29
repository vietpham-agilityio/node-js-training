import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsOptional,
  IsEmail,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty({
    description: 'User first name',
    example: 'Jimmy',
  })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Outaly',
  })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    description: 'Email of user',
    example: 'example@email.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Vietnamese phone number',
    example: '0987654321',
  })
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phoneNumber!: string;

  @ApiPropertyOptional({
    description: 'User address (introduced in v2)',
    example: '123 Nguyen Trai, District 1, Ho Chi Minh City',
  })
  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateUserDTO extends PartialType(CreateUserDTO) {}
