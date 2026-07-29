import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { InventoryItemShape } from '@app/constants';

@Entity('inventory_items')
export class InventoryItem implements InventoryItemShape {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'int', default: 0 })
  quantity!: number;
}

