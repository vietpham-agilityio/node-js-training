import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { USER_ROLE } from '@app/constants';

@Entity('users')
export class UserEntity {
  @ApiProperty({ description: 'User id', example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ description: 'User first name', example: 'Jimmy' })
  @Column()
  firstName!: string;

  @ApiProperty({ description: 'User last name', example: 'Outaly' })
  @Column()
  lastName!: string;

  @ApiProperty({ description: 'Email of user', example: 'example@email.com' })
  @Column()
  email!: string;

  @ApiProperty({
    description: 'Vietnamese phone number',
    example: '0987654321',
  })
  @Column()
  phoneNumber!: string;

  @Column({ select: false })
  password!: string;

  @ApiProperty({
    description: 'User role in application',
    enum: USER_ROLE,
    example: USER_ROLE.USER,
  })
  @Column({
    type: 'text',
    enum: USER_ROLE,
    default: USER_ROLE.USER
  })
  role?: USER_ROLE;

  @ApiPropertyOptional({
    description: 'User address (introduced in v2)',
    example: '123 Nguyen Trai, District 1, Ho Chi Minh City',
  })
  @Column({ nullable: true })
  address?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
