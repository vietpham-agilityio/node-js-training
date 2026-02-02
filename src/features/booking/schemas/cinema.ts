// Effect
import { Schema } from 'effect';

// Type
import { Movie } from './movie';

// Status schemas using Schema.Literal
export const ShowtimeStatusSchema = Schema.Literal(
  'active',
  'cancelled',
  'completed',
);
export const SeatReservationStatusSchema = Schema.Literal(
  'reserved',
  'confirmed',
  'released',
);
export const SeatStatusSchema = Schema.Literal(
  'available',
  'booked',
  'selected',
);

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
  status: ShowtimeStatusSchema,
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
  status: SeatReservationStatusSchema,
  createdAt: Schema.String,
});

// Core schema for Seat
export const SeatSchema = Schema.Struct({
  id: Schema.String,
  row: Schema.String,
  number: Schema.Number,
  status: SeatStatusSchema,
});

// Status types derived from schemas
export type ShowtimeStatus = Schema.Schema.Type<typeof ShowtimeStatusSchema>;
export type SeatReservationStatus = Schema.Schema.Type<
  typeof SeatReservationStatusSchema
>;
export type SeatStatus = Schema.Schema.Type<typeof SeatStatusSchema>;

// Base types derived from schemas
export type Cinema = Schema.Schema.Type<typeof CinemaSchema>;
export type CinemaHallBase = Schema.Schema.Type<typeof CinemaHallSchema>;
export type ShowTimeBase = Schema.Schema.Type<typeof ShowtimeSchema>;
export type SeatReservationBase = Schema.Schema.Type<
  typeof SeatReservationSchema
>;
export type SeatBase = Schema.Schema.Type<typeof SeatSchema>;

// Extended interfaces/types with optional nested relationships
export interface CinemaHall extends CinemaHallBase {
  cinema?: Cinema;
}

export interface ShowTime extends ShowTimeBase {
  cinemaHall?: CinemaHall;
  movie?: Movie;
}

export type SeatReservation = SeatReservationBase;
export type Seat = SeatBase;

export interface CinemaWithShowTimes {
  cinema: Cinema;
  cinemaHall: CinemaHall;
  showTimes: ShowTime[];
}
