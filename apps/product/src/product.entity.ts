import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('products')
export class ProductEntity {
  @ApiProperty({ description: 'Product id', example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ description: 'Product name', example: 'Sony Camera' })
  @Column()
  name!: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Modern camera in future',
  })
  @Column({ type: 'text' })
  description!: string;

  @ApiProperty({ description: 'Product price (VND)', example: 49000000 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @ApiProperty({ description: 'Available stock quantity', example: 100 })
  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
