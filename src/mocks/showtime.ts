// Types
import { Cinema, CinemaHall, Showtime } from '@/types';

// Utils
import { generateShowtimesForCinema } from '@/utils';

/**
 * Mock Cinema data with CinemaHall information
 */
const MOCK_CINEMAS_DATA: {
  cinema: Cinema;
  cinemaHall: CinemaHall;
}[] = [
  {
    cinema: {
      id: '1',
      name: 'Central Park CGV',
      location: 'Central Park Mall',
      address: 'Jl. Letjen S. Parman, Jakarta Barat',
      city: 'Jakarta',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    cinemaHall: {
      id: 'hall-1',
      cinemaId: '1',
      name: 'Hall 1',
      hallType: 'Regular',
      totalSeats: 150,
      seatLayout: {},
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    cinema: {
      id: '2',
      name: 'FX Sudirman XXI',
      location: 'FX Sudirman',
      address: 'Jl. Jend. Sudirman, Jakarta Pusat',
      city: 'Jakarta',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    cinemaHall: {
      id: 'hall-2',
      cinemaId: '2',
      name: 'Hall 2',
      hallType: 'Regular',
      totalSeats: 120,
      seatLayout: {},
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    cinema: {
      id: '3',
      name: 'Kelapa Gading IMAX',
      location: 'Mall Kelapa Gading',
      address: 'Jl. Boulevard Barat Raya, Jakarta Utara',
      city: 'Jakarta',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    cinemaHall: {
      id: 'hall-3',
      cinemaId: '3',
      name: 'IMAX Hall',
      hallType: 'IMAX',
      totalSeats: 200,
      seatLayout: {},
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
];

/**
 * Interface for Cinema with Showtimes grouped structure (for UI display)
 */
export interface CinemaWithShowtimes {
  cinema: Cinema;
  cinemaHall: CinemaHall;
  showtimes: Showtime[];
}

/**
 * Generate mock showtimes grouped by cinema
 * @param movieId - The movie ID
 * @param showDate - The show date in YYYY-MM-DD format
 * @returns Array of CinemaWithShowtimes
 */
export const generateMockCinemasWithShowtimes = (
  movieId: string,
  showDate: string,
): CinemaWithShowtimes[] => {
  let baseId = 1;

  return MOCK_CINEMAS_DATA.map(({ cinema, cinemaHall }) => {
    const showtimes = generateShowtimesForCinema(
      cinema.id,
      cinemaHall.id,
      movieId,
      showDate,
      baseId,
    );

    baseId += showtimes.length;

    return {
      cinema,
      cinemaHall,
      showtimes: showtimes.map(showtime => ({
        ...showtime,
        cinemaHall: {
          ...cinemaHall,
          cinema,
        },
      })),
    };
  });
};

/**
 * Legacy export for backward compatibility
 * Uses default values for movieId and showDate
 * @deprecated Use generateMockCinemasWithShowtimes with proper movieId and showDate
 */
export const MOCK_CINEMAS = generateMockCinemasWithShowtimes('', '');
