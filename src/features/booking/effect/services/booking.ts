// Effect
import { Effect, Context } from 'effect';

// Error
import { BookingError } from '../../error/booking';

// Types
import { CreateBookingData } from '../../services/booking';

// Schema
import { Booking } from '../../schemas/booking';

export class BookingService extends Context.Tag('BookingServiceTag')<
  BookingService,
  {
    readonly getBookings: (
      userId: string,
      status?: string,
    ) => Effect.Effect<Booking[], BookingError, never>;

    readonly getBookingById: (
      bookingId: string,
    ) => Effect.Effect<Booking, BookingError, never>;

    readonly createBooking: (
      data: CreateBookingData,
    ) => Effect.Effect<Booking, BookingError, never>;

    readonly cancelBooking: (
      bookingId: string,
    ) => Effect.Effect<void, BookingError, never>;

    readonly reserveSeats: (
      showtimeId: string,
      userId: string,
      seats: string[],
    ) => Effect.Effect<
      {
        readonly id: string;
        readonly status: 'reserved' | 'confirmed' | 'released';
        readonly createdAt: string;
        readonly userId: string;
        readonly showtimeId: string;
        readonly seatNumbers: readonly string[];
        readonly reservedUntil: string;
      },
      BookingError,
      never
    >;

    readonly releaseSeats: (
      reservationId: string,
    ) => Effect.Effect<void, BookingError, never>;

    readonly getBookingsPaginated: (
      userId: string,
      status?: string,
      page?: number,
      limit?: number,
    ) => Effect.Effect<Booking[], BookingError, never>;
  }
>() {}
