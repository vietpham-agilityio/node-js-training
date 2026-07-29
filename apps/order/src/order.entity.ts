import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus, Order as OrderShape } from '@app/constants';

@Entity('orders')
export class Order implements OrderShape {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  productId!: number;

  @Column({ type: 'int' })
  price!: number;

  @Column({ type: 'text', default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ type: 'int' })
  quantity!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
