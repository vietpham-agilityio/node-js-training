import { Movie, MovieStatus, PromoCode, PromoCodeStatus } from '@/types';

export const MOVIES_MOCK: Movie[] = [
  {
    id: '1',
    title: 'The Shawshank Redemption',
    synopsis:
      'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    posterUrl:
      'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    rating: 4.9,
    durationMinutes: 142,
    genre: ['Drama', 'Crime'],
    language: 'EN',
    trailerUrl: ['https://youtube.com/watch?v=6hB3S9bIaco'],
    releaseDate: '1994-09-23',
    createdAt: '2023-01-15T08:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
    status: MovieStatus.NOW_PLAYING,
  },
  {
    id: '2',
    title: 'The Godfather',
    synopsis:
      'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    posterUrl:
      'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    rating: 4.8,
    durationMinutes: 175,
    genre: ['Drama', 'Crime'],
    language: 'EN',
    trailerUrl: ['https://youtube.com/watch?v=sY1S34973zA'],
    releaseDate: '1972-03-24',
    createdAt: '2023-02-10T09:15:00Z',
    updatedAt: '2024-11-28T14:20:00Z',
    status: MovieStatus.NOW_PLAYING,
  },
  {
    id: '3',
    title: 'The Dark Knight',
    synopsis:
      'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest tests.',
    posterUrl:
      'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    rating: 4.7,
    durationMinutes: 152,
    genre: ['Action', 'Crime', 'Drama', 'Thriller'],
    language: 'EN',
    trailerUrl: ['https://youtube.com/watch?v=EXeTwQWrcwY'],
    releaseDate: '2008-07-18',
    createdAt: '2023-03-05T11:45:00Z',
    updatedAt: '2024-12-05T16:10:00Z',
    status: MovieStatus.NOW_PLAYING,
  },
  {
    id: '4',
    title: 'Pulp Fiction',
    synopsis:
      'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
    posterUrl:
      'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    rating: 4.6,
    durationMinutes: 154,
    genre: ['Crime', 'Drama'],
    language: 'EN',
    trailerUrl: ['https://youtube.com/watch?v=s7EdQ4FqbhY'],
    releaseDate: '1994-10-14',
    createdAt: '2023-04-20T13:30:00Z',
    updatedAt: '2024-11-30T09:45:00Z',
    status: MovieStatus.COMING_SOON,
  },
  {
    id: '5',
    title: 'Forrest Gump',
    synopsis:
      'The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.',
    posterUrl:
      'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
    rating: 4.5,
    durationMinutes: 142,
    genre: ['Drama', 'Romance'],
    language: 'EN',
    trailerUrl: ['https://youtube.com/watch?v=bLvqoHBptjg'],
    releaseDate: '1994-07-06',
    createdAt: '2023-05-12T15:00:00Z',
    updatedAt: '2024-12-02T11:20:00Z',
    status: MovieStatus.COMING_SOON,
  },
];

export const MOCK_PROMOTIONS: PromoCode[] = [
  {
    id: '1',
    code: 'Student Holiday',
    description: 'Maximal only for two people',
    discountType: PromoCodeStatus.PERCENTAGE,
    discountValue: 50,
  },
  {
    id: '2',
    code: 'Student Holiday',
    description: 'Maximal only for two people',
    discountType: PromoCodeStatus.PERCENTAGE,
    discountValue: 50,
  },
  {
    id: '3',
    code: 'Student Holiday',
    description: 'Maximal only for two people',
    discountType: PromoCodeStatus.PERCENTAGE,
    discountValue: 50,
  },
];
