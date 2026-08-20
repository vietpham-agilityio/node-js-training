import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { decimalTransformer } from '../../../database/transformers/decimal.transformer';
import { Showtime } from '../../showtimes/entities/showtime.entity';
import { MovieGenre } from './movie-genre.entity';

// BR-02: duration_minutes must be greater than 0
@Check('chk_movies_duration_positive', '"duration_minutes" > 0')
// BR-03: rating is null or between 0.0 and 10.0
@Check(
  'chk_movies_rating_range',
  '"rating" IS NULL OR ("rating" >= 0.0 AND "rating" <= 10.0)',
)
@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  synopsis: string | null;

  @Column({ name: 'poster_url', type: 'varchar', nullable: true })
  posterUrl: string | null;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column()
  language: string;

  @Column({ name: 'release_date', type: 'date' })
  releaseDate: string;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 1,
    nullable: true,
    transformer: decimalTransformer,
  })
  rating: number | null;

  // ADR-010: soft delete via is_active — movies are never hard-deleted in normal operation
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => MovieGenre, (movieGenre) => movieGenre.movie)
  movieGenres: MovieGenre[];

  @OneToMany(() => Showtime, (showtime) => showtime.movie)
  showtimes: Showtime[];
}
