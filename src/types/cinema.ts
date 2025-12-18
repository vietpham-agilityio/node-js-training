import { Movie } from './movie';

export enum ShowtimeStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum SeatReservationStatus {
  RESERVED = 'reserved',
  CONFIRMED = 'confirmed',
  RELEASED = 'released',
}

export enum SeatStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  SELECTED = 'selected',
}

export interface Cinema {
  id: string;
  name: string;
  location: string;
  address: string;
  city: string;
  phoneNumber?: string;
  facilities?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CinemaHall {
  id: string;
  cinemaId: string;
  name: string;
  hallType: string;
  totalSeats: number;
  seatLayout: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  cinema?: Cinema;
}

export interface Showtime {
  id: string;
  movieId: string;
  cinemaHallId: string;
  showDate: string;
  showTime: string;
  endTime: string;
  price: number;
  availableSeats: number;
  status: ShowtimeStatus;
  createdAt: string;
  updatedAt: string;
  cinemaHall?: CinemaHall;
  movie?: Movie;
}

export interface SeatReservation {
  id: string;
  showtimeId: string;
  userId: string;
  seatNumbers: string[];
  reservedUntil: string;
  status: SeatReservationStatus;
  createdAt: string;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
}

export interface CinemaWithShowtimes {
  cinema: Cinema;
  cinemaHall: CinemaHall;
  showtimes: Showtime[];
}
