import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
  IsOptional,
  MinLength,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDTO {
  @ApiProperty({
    description: 'Email of the account to log in with',
    example: 'example@email.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Account password',
    example: 'Good_user@123',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RegisterDTO {
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
    description: 'Account password',
    example: 'Good_user@123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password!: string;

  @ApiPropertyOptional({
    description: 'User address',
    example: '123 Nguyen Trai, District 1, Ho Chi Minh City',
  })
  @IsString()
  @IsOptional()
  address?: string;
}
