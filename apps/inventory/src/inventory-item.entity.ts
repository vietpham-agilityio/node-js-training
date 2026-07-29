import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'int', default: 0 })
  quantity!: number;
}

