import { Movie } from './movie';

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
  status: 'active' | 'cancelled' | 'completed';
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
  status: 'reserved' | 'confirmed' | 'released';
  createdAt: string;
}
