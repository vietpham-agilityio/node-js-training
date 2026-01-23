// Supabase
import { supabase } from '@/services/supabase/client';

// Effect
import { Effect } from 'effect';

// Types
import { Booking } from '@/features/booking/schemas/booking';
import { SeatReservation } from '@/features/booking/schemas/cinema';

// Utils
import { keysToCamel } from '@/utils/convert';

// Constants
import { ERROR_MESSAGES, PAGINATION } from '@/constants';
import { BOOKING_STATUS, SEAT_RESERVATION_STATUS } from '@/constants/status';

// Error
import { BookingError } from '@/features/booking/error/booking';

export interface CreateBookingData {
  userId: string;
  showtimeId: string;
  seats: string[];
  totalAmount: number;
  promoCodeId?: string;
  discountAmount?: number;
  walletId: string;
}

interface BookingTransactionResult {
  bookingId: string;
  bookingNumber: string;
  ticketIds: string[];
  walletTransactionId: string;
  newWalletBalance: number;
}

export class BookingsServiceEffect {
  private static instance: BookingsServiceEffect;

  private constructor() {}

  static getInstance(): BookingsServiceEffect {
    if (!BookingsServiceEffect.instance) {
      BookingsServiceEffect.instance = new BookingsServiceEffect();
    }
    return BookingsServiceEffect.instance;
  }

  getBookings = (userId: string, status?: string) =>
    Effect.tryPromise({
      try: async () => {
        let query = supabase
          .from('bookings')
          .select(
            `
          id,
          user_id,
          showtime_id,
          booking_number,
          total_seats,
          seat_numbers,
          subtotal,
          discount_amount,
          total_amount,
          payment_method,
          payment_status,
          booking_status,
          expires_at,
          created_at,
          updated_at,
          showtime:showtimes!inner(
            id,
            show_date,
            show_time,
            end_time,
            price,
            movie:movies!inner(
              id,
              title,
              poster_url,
              genre,
              duration_minutes,
              rating
            ),
            cinema_hall:cinema_halls!inner(
              id,
              name,
              hall_type,
              cinema:cinemas!inner(
                id,
                name,
                city,
                address
              )
            )
          )
        `,
          )
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (status) {
          query = query.eq('booking_status', status);
        }

        const { data, error } = await query;

        if (error) {
          throw BookingError.bookingFailed(error.message);
        }

        return keysToCamel(data || []) as Booking[];
      },
      catch: (error: unknown) =>
        BookingError.bookingFailed(error instanceof Error ? error.message : ''),
    });

  getBookingById = (bookingId: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data, error } = await supabase
          .from('bookings')
          .select(
            `
          *,
          showtime:showtimes!inner(
            *,
            movie:movies!inner(*),
            cinema_hall:cinema_halls!inner(
              *,
              cinema:cinemas!inner(*)
            )
          ),
          tickets:tickets(*)
        `,
          )
          .eq('id', bookingId)
          .single();

        if (error) {
          throw BookingError.bookingFailed(error.message);
        }

        return keysToCamel(data) as Booking;
      },
      catch: (error: unknown) =>
        BookingError.bookingFailed(error instanceof Error ? error.message : ''),
    });

  createBooking = (data: CreateBookingData) =>
    Effect.tryPromise({
      try: async () => {
        const subtotal = data.totalAmount + (data.discountAmount || 0);

        const { data: result, error } = await supabase.rpc(
          'create_booking_with_payment',
          {
            p_user_id: data.userId,
            p_wallet_id: data.walletId,
            p_showtime_id: data.showtimeId,
            p_seat_numbers: data.seats,
            p_subtotal: subtotal,
            p_total_amount: data.totalAmount,
            p_discount_amount: data.discountAmount || 0,
            p_promo_code_id: data.promoCodeId,
          },
        );

        if (error) {
          if (
            error.message.includes(ERROR_MESSAGES.INSUFFICIENT_WALLET_BALANCE)
          ) {
            throw BookingError.insufficientWalletBalance(error.message);
          } else if (error.message.includes(ERROR_MESSAGES.WALLET_NOT_FOUND)) {
            throw BookingError.walletNotFound(error.message);
          } else {
            throw BookingError.bookingFailed(error.message);
          }
        }

        if (!result || result.length === 0) {
          throw BookingError.noResultReturnedFromBookingTransaction();
        }

        const txResult = keysToCamel(result[0]) as BookingTransactionResult;

        // Fetch complete booking with all relations
        return await Effect.runPromise(this.getBookingById(txResult.bookingId));
      },
      catch: (error: unknown) =>
        BookingError.checkoutFailed(
          error instanceof Error ? error.message : '',
        ),
    });

  /**
   * Cancel booking with refund using atomic transaction
   */
  cancelBooking = (bookingId: string) =>
    Effect.tryPromise({
      try: async () => {
        // Get booking to determine refund amount
        const booking = await Effect.runPromise(this.getBookingById(bookingId));

        if (!booking) {
          throw BookingError.bookingNotFound();
        }

        if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
          throw BookingError.bookingAlreadyCancelled();
        }

        // Call stored procedure for atomic cancel + refund
        const { error } = await supabase.rpc('cancel_booking_with_refund', {
          p_booking_id: bookingId,
          p_refund_amount: booking.totalAmount,
        });

        if (error) {
          throw error;
        }
      },
      catch: (error: unknown) =>
        BookingError.checkoutFailed(
          error instanceof Error ? error.message : '',
        ),
    });

  reserveSeats = (showtimeId: string, userId: string, seats: string[]) =>
    Effect.tryPromise({
      try: async () => {
        const reservedUntil = new Date();
        reservedUntil.setMinutes(reservedUntil.getMinutes() + 10); // 10 minute expiry

        const { data, error } = await supabase
          .from('seat_reservations')
          .insert({
            showtime_id: showtimeId,
            user_id: userId,
            seat_numbers: seats,
            reserved_until: reservedUntil.toISOString(),
            status: SEAT_RESERVATION_STATUS.RESERVED,
          })
          .select()
          .single();

        if (error) {
          throw BookingError.reserveSeatsFailed(error.message);
        }

        return keysToCamel(data) as SeatReservation;
      },
      catch: (error: unknown) =>
        BookingError.reserveSeatsFailed(
          error instanceof Error ? error.message : '',
        ),
    });

  releaseSeats = (reservationId: string) =>
    Effect.tryPromise({
      try: async () => {
        const { error } = await supabase
          .from('seat_reservations')
          .update({ status: SEAT_RESERVATION_STATUS.RELEASED })
          .eq('id', reservationId);

        if (error) {
          throw BookingError.releaseSeatsFailed(error.message);
        }
      },
      catch: (error: unknown) =>
        BookingError.releaseSeatsFailed(
          error instanceof Error ? error.message : '',
        ),
    });

  getBookingsPaginated = (
    userId: string,
    status?: string,
    page = PAGINATION.PAGE_OFFSET,
    limit = PAGINATION.PAGE_LIMIT,
  ) =>
    Effect.tryPromise({
      try: async () => {
        let query = supabase
          .from('bookings')
          .select(
            `
          id,
          booking_number,
          total_seats,
          seat_numbers,
          total_amount,
          booking_status,
          payment_status,
          created_at,
          showtime:showtimes!inner(
            id,
            show_date,
            show_time,
            price,
            movie:movies!inner(
              id,
              title,
              poster_url,
              genre,
              duration_minutes
            ),
            cinema_hall:cinema_halls!inner(
              id,
              name,
              cinema:cinemas!inner(
                id,
                name,
                city
              )
            )
          )
        `,
          )
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);

        if (status) {
          query = query.eq('booking_status', status);
        }

        const { data, error } = await query;

        if (error) {
          throw BookingError.bookingFailed(error.message);
        }

        return keysToCamel(data || []) as Booking[];
      },
      catch: (error: unknown) =>
        BookingError.bookingFailed(error instanceof Error ? error.message : ''),
    });
}

export const bookingsServiceEffect = BookingsServiceEffect.getInstance();
