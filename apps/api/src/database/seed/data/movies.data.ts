export interface MovieFixture {
  title: string;
  synopsis: string;
  posterUrl: string | null;
  durationMinutes: number;
  language: string;
  releaseDate: string;
  rating: number | null;
  genreNames: string[];
}

// 8-10 movies with genres, per DDR-009's demo catalogue.
export const MOVIE_FIXTURES: MovieFixture[] = [
  {
    title: 'The Last Signal',
    synopsis:
      "A deep-space relay operator picks up a transmission that shouldn't exist.",
    posterUrl: null,
    durationMinutes: 128,
    language: 'English',
    releaseDate: '2024-03-15',
    rating: 7.8,
    genreNames: ['Sci-Fi', 'Drama'],
  },
  {
    title: 'Midnight Heist',
    synopsis:
      'Five strangers, one vault, and eight hours before the city wakes up.',
    posterUrl: null,
    durationMinutes: 112,
    language: 'English',
    releaseDate: '2023-11-02',
    rating: 6.9,
    genreNames: ['Action'],
  },
  {
    title: 'Laughing Matters',
    synopsis:
      'A failing comedy club owner bets everything on one open-mic night.',
    posterUrl: null,
    durationMinutes: 98,
    language: 'English',
    releaseDate: '2025-01-10',
    rating: 7.2,
    genreNames: ['Comedy'],
  },
  {
    title: 'The Hollow House',
    synopsis:
      'A family moves into a house that keeps rearranging itself after dark.',
    posterUrl: null,
    durationMinutes: 105,
    language: 'English',
    releaseDate: '2024-10-31',
    rating: 6.5,
    genreNames: ['Horror'],
  },
  {
    title: 'Skyward Bound',
    synopsis:
      'A young inventor builds a glider to reach the clouds her village fears.',
    posterUrl: null,
    durationMinutes: 95,
    language: 'English',
    releaseDate: '2023-06-20',
    rating: 8.1,
    genreNames: ['Animation', 'Comedy'],
  },
  {
    title: 'Iron Horizon',
    synopsis:
      'A convoy of engineers races to seal a rift before it swallows the coast.',
    posterUrl: null,
    durationMinutes: 140,
    language: 'English',
    releaseDate: '2025-05-01',
    rating: 7.5,
    genreNames: ['Action', 'Sci-Fi'],
  },
  {
    title: 'Quiet Streets',
    synopsis:
      'A retired detective is pulled back into the one case he never closed.',
    posterUrl: null,
    durationMinutes: 110,
    language: 'English',
    releaseDate: '2022-09-14',
    rating: 8.4,
    genreNames: ['Drama'],
  },
  {
    title: 'Static',
    synopsis:
      'A late-night radio host starts receiving calls from a station that went dark decades ago.',
    posterUrl: null,
    durationMinutes: 99,
    language: 'English',
    releaseDate: '2024-02-02',
    rating: null,
    genreNames: ['Horror', 'Sci-Fi'],
  },
  {
    title: 'Wanderlight',
    synopsis:
      "A lantern-maker's apprentice crosses a shifting forest to deliver one last light.",
    posterUrl: null,
    durationMinutes: 102,
    language: 'English',
    releaseDate: '2023-12-25',
    rating: 7.9,
    genreNames: ['Animation', 'Drama'],
  },
];
