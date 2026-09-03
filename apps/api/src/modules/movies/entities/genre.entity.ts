import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { MovieGenre } from './movie-genre.entity';

// BR-13: genres.name is unique
@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => MovieGenre, (movieGenre) => movieGenre.genre)
  movieGenres: MovieGenre[];
}
