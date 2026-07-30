import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsOptional,
  IsEmail,
  IsEnum,
  MinLength,
  IsStrongPassword,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { USER_ROLE } from '@app/constants';

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

  @ApiProperty({
    description: 'Password of user account',
    example: 'Good_user@123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }
  )
  password!: string;

  @ApiPropertyOptional({
    description: 'User role in application',
    example: USER_ROLE.USER,
    enum: USER_ROLE,
  })
  @IsOptional()
  @IsEnum(USER_ROLE)
  role?: USER_ROLE;

  @ApiPropertyOptional({
    description: 'User address (introduced in v2)',
    example: '123 Nguyen Trai, District 1, Ho Chi Minh City',
  })
  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateUserDTO extends PartialType(CreateUserDTO) { }
