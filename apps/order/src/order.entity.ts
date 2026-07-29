import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, Order as OrderShape } from '@app/constants';

@Entity('orders')
export class Order implements OrderShape {
  @ApiProperty({ description: 'Order id', example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ description: 'Order name', example: 'Order Camera' })
  @Column()
  name!: string;

  @ApiProperty({ description: 'ID of the product being ordered', example: 12 })
  @Column()
  productId!: number;

  @ApiProperty({ description: 'Order price', example: 409999 })
  @Column({ type: 'int' })
  price!: number;

  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  @Column({ type: 'text', default: OrderStatus.PENDING })
  status!: OrderStatus;

  @ApiProperty({ description: 'Quantity ordered', example: 2 })
  @Column({ type: 'int' })
  quantity!: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
