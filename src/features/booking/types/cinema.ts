// Effect
import { Schema } from 'effect';

// Type
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

// Core schema for Cinema
export const CinemaSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  location: Schema.String,
  address: Schema.String,
  city: Schema.String,
  phoneNumber: Schema.optional(Schema.String),
  facilities: Schema.optional(Schema.Array(Schema.String)),
  isActive: Schema.Boolean,
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

// Core schema for CinemaHall
export const CinemaHallSchema = Schema.Struct({
  id: Schema.String,
  cinemaId: Schema.String,
  name: Schema.String,
  hallType: Schema.String,
  totalSeats: Schema.Number,
  seatLayout: Schema.Any,
  isActive: Schema.Boolean,
  createdAt: Schema.String,
  updatedAt: Schema.String,
  cinema: Schema.optional(CinemaSchema),
});

// Core schema for Showtime (without external type references)
export const ShowtimeSchema = Schema.Struct({
  id: Schema.String,
  movieId: Schema.String,
  cinemaHallId: Schema.String,
  showDate: Schema.String,
  showTime: Schema.String,
  endTime: Schema.String,
  price: Schema.Number,
  availableSeats: Schema.Number,
  status: Schema.Enums(ShowtimeStatus),
  createdAt: Schema.String,
  updatedAt: Schema.String,
  cinemaHall: Schema.optional(CinemaHallSchema),
});

// Core schema for SeatReservation
export const SeatReservationSchema = Schema.Struct({
  id: Schema.String,
  showtimeId: Schema.String,
  userId: Schema.String,
  seatNumbers: Schema.Array(Schema.String),
  reservedUntil: Schema.String,
  status: Schema.Enums(SeatReservationStatus),
  createdAt: Schema.String,
});

// Core schema for Seat
export const SeatSchema = Schema.Struct({
  id: Schema.String,
  row: Schema.String,
  number: Schema.Number,
  status: Schema.Enums(SeatStatus),
});

// Derive base types from schemas
export type Cinema = Schema.Schema.Type<typeof CinemaSchema>;
export type CinemaHallBase = Schema.Schema.Type<typeof CinemaHallSchema>;
export type ShowtimeBase = Schema.Schema.Type<typeof ShowtimeSchema>;
export type SeatReservationBase = Schema.Schema.Type<
  typeof SeatReservationSchema
>;
export type SeatBase = Schema.Schema.Type<typeof SeatSchema>;

export interface CinemaHall extends CinemaHallBase {
  cinema?: Cinema;
}

export interface Showtime extends ShowtimeBase {
  cinemaHall?: CinemaHall;
  movie?: Movie;
}

export interface CinemaWithShowtimes {
  cinema: Cinema;
  cinemaHall: CinemaHall;
  showtimes: Showtime[];
}
