import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { SeatHold } from '../../reservations/entities/seat-hold.entity';
import { Ticket } from '../../reservations/entities/ticket.entity';
import { Hall } from './hall.entity';

// BR-15: (hall_id, seat_label) is unique on seats
@Index('uq_seats_hall_label', ['hallId', 'seatLabel'], { unique: true })
// BR-05: seat_column must be greater than 0
@Check('chk_seats_seat_column_positive', '"seat_column" > 0')
@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'hall_id' })
  hallId: string;

  @ManyToOne(() => Hall, (hall) => hall.seats, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'hall_id' })
  hall: Hall;

  @Column({ name: 'seat_row' })
  seatRow: string;

  @Column({ name: 'seat_column', type: 'int' })
  seatColumn: number;

  @Column({ name: 'seat_label' })
  seatLabel: string;

  // ADR-010: soft delete via is_active
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => SeatHold, (seatHold) => seatHold.seat)
  seatHolds: SeatHold[];

  @OneToMany(() => Ticket, (ticket) => ticket.seat)
  tickets: Ticket[];
}
