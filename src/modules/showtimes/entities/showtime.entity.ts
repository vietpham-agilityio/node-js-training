import {
  Check,
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

import { decimalTransformer } from '../../../database/transformers/decimal.transformer';
import { Movie } from '../../movies/entities/movie.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { SeatHold } from '../../reservations/entities/seat-hold.entity';
import { Hall } from './hall.entity';
import { ShowtimeStatus } from '../enums/showtime-status.enum';

// BR-16: (hall_id, show_date, show_time) is unique on showtimes
@Index('uq_showtimes_hall_date_time', ['hallId', 'showDate', 'showTime'], {
  unique: true,
})
// BR-07: base_price is 0 or greater
@Check('chk_showtimes_base_price_non_negative', '"base_price" >= 0')
@Entity('showtimes')
export class Showtime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'movie_id' })
  movieId: string;

  @ManyToOne(() => Movie, (movie) => movie.showtimes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @Index()
  @Column({ name: 'hall_id' })
  hallId: string;

  @ManyToOne(() => Hall, (hall) => hall.showtimes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'hall_id' })
  hall: Hall;

  // ADR-013: showtimes by date is a known access path
  @Index()
  @Column({ name: 'show_date', type: 'date' })
  showDate: string;

  @Column({ name: 'show_time', type: 'time' })
  showTime: string;

  // BR-28: computed from movie.duration_minutes at write time — not derived here
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({
    name: 'base_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  basePrice: number;

  // BR-06: scheduled | active | completed | cancelled — cancelled doubles as the
  // soft-delete state for showtimes (ADR-010)
  @Column({
    type: 'enum',
    enum: ShowtimeStatus,
    default: ShowtimeStatus.SCHEDULED,
  })
  status: ShowtimeStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => SeatHold, (seatHold) => seatHold.showtime)
  seatHolds: SeatHold[];

  @OneToMany(() => Reservation, (reservation) => reservation.showtime)
  reservations: Reservation[];
}
