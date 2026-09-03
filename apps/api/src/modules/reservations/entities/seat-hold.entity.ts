import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Seat } from '../../showtimes/entities/seat.entity';
import { Showtime } from '../../showtimes/entities/showtime.entity';
import { User } from '../../users/entities/user.entity';
import { Reservation } from './reservation.entity';
import { SeatHoldStatus } from '../enums/seat-hold-status.enum';

// BR-17/ADR-007: a seat can have at most one active (held|confirmed) hold per
// showtime — the overbooking guarantee, enforced by the database rather than
// application logic. This is the exact condition the index is written against
// (docs/database/README.md) — do not change the status vocabulary without it.
@Index('uq_seat_hold_active', ['showtimeId', 'seatId'], {
  unique: true,
  where: "status IN ('held', 'confirmed')",
})
// ADR-013: seat holds by showtime and status is a known access path
@Index('idx_seat_holds_showtime_status', ['showtimeId', 'status'])
// DDR-001 follow-up: indexed range scan for the 60s expiry sweep job (BR-27)
@Index('idx_seat_holds_held_until_held', ['heldUntil'], {
  where: "status = 'held'",
})
@Entity('seat_holds')
export class SeatHold {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'showtime_id' })
  showtimeId: string;

  @ManyToOne(() => Showtime, (showtime) => showtime.seatHolds, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'showtime_id' })
  showtime: Showtime;

  @Index()
  @Column({ name: 'seat_id' })
  seatId: string;

  @ManyToOne(() => Seat, (seat) => seat.seatHolds, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seat_id' })
  seat: Seat;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.seatHolds, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // RESERVATIONS confirms SEAT_HOLDS — 0..1:0..N, optional; starts NULL and is
  // set only when DDR-002's confirmation transaction writes the reservation.
  @Index()
  @Column({ name: 'reservation_id', type: 'uuid', nullable: true })
  reservationId: string | null;

  @ManyToOne(() => Reservation, (reservation) => reservation.seatHolds, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation | null;

  // BR-08: held | confirmed | released | expired
  @Column({ type: 'enum', enum: SeatHoldStatus, default: SeatHoldStatus.HELD })
  status: SeatHoldStatus;

  // BR-25: held_until = created_at + 10 minutes at insert (DDR-001)
  @Column({
    name: 'held_until',
    type: 'timestamptz',
    default: () => "now() + interval '10 minutes'",
  })
  heldUntil: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
