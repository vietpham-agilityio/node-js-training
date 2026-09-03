import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Showtime } from '../../showtimes/entities/showtime.entity';
import { User } from '../../users/entities/user.entity';
import { ReservationStatus } from '../enums/reservation-status.enum';
import { SeatHold } from './seat-hold.entity';
import { Ticket } from './ticket.entity';

// ADR-013: reservations by user and status is a known access path
@Index('idx_reservations_user_status', ['userId', 'status'])
@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // BR-18/DDR-004: RSV-YYYYMMDD-XXXXXX, generated inside the confirmation
  // transaction with retry-on-collision — not enforced here beyond uniqueness.
  @Column({ name: 'reservation_number', unique: true })
  reservationNumber: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ name: 'showtime_id' })
  showtimeId: string;

  @ManyToOne(() => Showtime, (showtime) => showtime.reservations, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'showtime_id' })
  showtime: Showtime;

  // BR-09: confirmed | cancelled | completed
  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.CONFIRMED,
  })
  status: ReservationStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => SeatHold, (seatHold) => seatHold.reservation)
  seatHolds: SeatHold[];

  @OneToMany(() => Ticket, (ticket) => ticket.reservation)
  tickets: Ticket[];
}
