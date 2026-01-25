import { Effect, Layer } from 'effect';

// Services
import {
  bookingsServiceEffect,
  type CreateBookingData,
} from '../../services/booking';

// Effect
import { BookingService } from '../services/booking';

export const BookingServiceLayer = Layer.effect(
  BookingService,
  Effect.gen(function* () {
    return {
      getBookings: (userId: string, status?: string) =>
        bookingsServiceEffect.getBookings(userId, status),

      getBookingById: (bookingId: string) =>
        bookingsServiceEffect.getBookingById(bookingId),

      createBooking: (data: CreateBookingData) =>
        bookingsServiceEffect.createBooking(data),

      cancelBooking: (showtimeId: string, userId: string, seats: string[]) =>
        bookingsServiceEffect.reserveSeats(showtimeId, userId, seats),

      reserveSeats: (showtimeId: string, userId: string, seats: string[]) =>
        bookingsServiceEffect.reserveSeats(showtimeId, userId, seats),

      releaseSeats: (reservationId: string) =>
        bookingsServiceEffect.releaseSeats(reservationId),

      getBookingsPaginated: (
        userId: string,
        status?: string,
        page?: number,
        limit?: number,
      ) =>
        bookingsServiceEffect.getBookingsPaginated(userId, status, page, limit),
    } as const;
  }),
);
