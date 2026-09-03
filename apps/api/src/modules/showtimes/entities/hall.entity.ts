import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Seat } from './seat.entity';
import { Showtime } from './showtime.entity';
import { HallType } from '../enums/hall-type.enum';

// BR-14: halls.name is unique
@Entity('halls')
export class Hall {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  // BR-04: hall_type is '2D', '3D' or 'IMAX'
  @Column({ name: 'hall_type', type: 'enum', enum: HallType })
  hallType: HallType;

  // ADR-010: soft delete via is_active
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Seat, (seat) => seat.hall)
  seats: Seat[];

  @OneToMany(() => Showtime, (showtime) => showtime.hall)
  showtimes: Showtime[];
}
