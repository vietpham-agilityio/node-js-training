import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Genre } from './genre.entity';
import { Movie } from './movie.entity';

// MOVIES tagged via MOVIE_GENRES — a pure assignment table, so the composite
// (movie_id, genre_id) is the primary key with no surrogate id (docs/database/README.md).
@Entity('movie_genres')
export class MovieGenre {
  @PrimaryColumn({ name: 'movie_id' })
  movieId: string;

  // The PK index only serves movie_id-led lookups, so genre_id needs its own
  // index for the reverse direction (ADR-013).
  @Index()
  @PrimaryColumn({ name: 'genre_id' })
  genreId: string;

  @ManyToOne(() => Movie, (movie) => movie.movieGenres, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => Genre, (genre) => genre.movieGenres, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'genre_id' })
  genre: Genre;
}
