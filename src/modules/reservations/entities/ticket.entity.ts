import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { decimalTransformer } from '../../../database/transformers/decimal.transformer';
import { Seat } from '../../showtimes/entities/seat.entity';
import { Reservation } from './reservation.entity';
import { TicketStatus } from '../enums/ticket-status.enum';

// BR-20: (reservation_id, seat_id) is unique on tickets
@Index('uq_tickets_reservation_seat', ['reservationId', 'seatId'], {
  unique: true,
})
// BR-11: price is 0 or greater
@Check('chk_tickets_price_non_negative', '"price" >= 0')
@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'reservation_id' })
  reservationId: string;

  @ManyToOne(() => Reservation, (reservation) => reservation.tickets, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @Index()
  @Column({ name: 'seat_id' })
  seatId: string;

  @ManyToOne(() => Seat, (seat) => seat.tickets, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seat_id' })
  seat: Seat;

  // BR-19/DDR-004: TKT-{reservation suffix}-{seat sequence}, generated at write
  // time with retry-on-collision — not enforced here beyond uniqueness.
  @Column({ name: 'ticket_number', unique: true })
  ticketNumber: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  price: number;

  // BR-10: valid | cancelled
  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.VALID })
  status: TicketStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
