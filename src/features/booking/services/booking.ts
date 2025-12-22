import { supabase } from '@/services/supabase/client';

// Types
import {
  Booking,
  BookingStatus,
  PaymentStatus,
  TicketStatus,
} from '@/features/booking/types/booking';
import {
  SeatReservation,
  SeatReservationStatus,
} from '@/features/booking/types/cinema';

// Utils
import { keysToCamel } from '@/utils/convert';

// Constants
import { PAGINATION } from '@/constants';

export interface CreateBookingData {
  userId: string;
  showtimeId: string;
  seats: string[];
  totalAmount: number;
  promoCodeId?: string;
  discountAmount?: number;
}

export class BookingsService {
  private static instance: BookingsService;

  private constructor() {}

  static getInstance(): BookingsService {
    if (!BookingsService.instance) {
      BookingsService.instance = new BookingsService();
    }
    return BookingsService.instance;
  }

  async getBookings(userId: string, status?: string): Promise<Booking[]> {
    try {
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
        throw error;
      }

      return keysToCamel(data || []) as Booking[];
    } catch (error) {
      throw error;
    }
  }

  async getBookingById(bookingId: string): Promise<Booking> {
    try {
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
        throw error;
      }

      return keysToCamel(data) as Booking;
    } catch (error) {
      throw error;
    }
  }

  async createBooking(data: CreateBookingData): Promise<Booking> {
    try {
      // Generate booking number
      const { data: bookingNumber } = await supabase.rpc(
        'generate_booking_number',
      );

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: data.userId,
          showtime_id: data.showtimeId,
          booking_number: bookingNumber || `BK${Date.now()}`,
          total_seats: data.seats.length,
          seat_numbers: data.seats,
          subtotal: data.totalAmount + (data.discountAmount || 0),
          discount_amount: data.discountAmount || 0,
          total_amount: data.totalAmount,
          promo_code_id: data.promoCodeId,
          payment_status: PaymentStatus.PAID,
          booking_status: BookingStatus.ACTIVE,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (bookingError) {
        throw bookingError;
      }

      // Create tickets for each seat
      const ticketPromises = data.seats.map(async seat => {
        // Generate ticket number
        const { data: ticketNumber } = await supabase.rpc(
          'generate_ticket_number',
        );

        const fallbackTicketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

        // Generate QR code data
        const { data: qrData } = await supabase.rpc('generate_qr_code_data', {
          p_booking_id: booking.id,
          p_seat_number: seat,
          p_ticket_id: `temp-${Date.now()}`,
        });

        const fallbackQrData = JSON.stringify({
          booking_id: booking.id,
          seat,
          timestamp: Date.now(),
        });

        return supabase.from('tickets').insert({
          booking_id: booking.id,
          seat_number: seat,
          ticket_number: ticketNumber || fallbackTicketNumber,
          qr_code_data: qrData || fallbackQrData,
          price: data.totalAmount / data.seats.length,
          status: TicketStatus.ACTIVE,
        });
      });

      await Promise.all(ticketPromises);

      // Update available seats using database function
      try {
        await supabase.rpc('decrement_available_seats', {
          showtime_id: data.showtimeId,
          seats_count: data.seats.length,
        });
      } catch (seatError) {
        console.error('Error updating available seats:', seatError);
        // Continue - booking is created, seats can be updated manually
      }

      // Fetch complete booking with all relations
      return await this.getBookingById(booking.id);
    } catch (error) {
      throw error;
    }
  }

  async cancelBooking(bookingId: string): Promise<void> {
    try {
      // Update booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          booking_status: BookingStatus.CANCELLED,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (bookingError) {
        throw bookingError;
      }

      // Update all tickets for this booking
      const { error: ticketsError } = await supabase
        .from('tickets')
        .update({ status: TicketStatus.CANCELLED })
        .eq('booking_id', bookingId);

      if (ticketsError) {
        console.error('Error cancelling tickets:', ticketsError);
      }
    } catch (error) {
      throw error;
    }
  }

  async reserveSeats(
    showtimeId: string,
    userId: string,
    seats: string[],
  ): Promise<SeatReservation> {
    try {
      const reservedUntil = new Date();
      reservedUntil.setMinutes(reservedUntil.getMinutes() + 10); // 10 minute expiry

      const { data, error } = await supabase
        .from('seat_reservations')
        .insert({
          showtime_id: showtimeId,
          user_id: userId,
          seat_numbers: seats,
          reserved_until: reservedUntil.toISOString(),
          status: SeatReservationStatus.RESERVED,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return keysToCamel(data) as SeatReservation;
    } catch (error) {
      throw error;
    }
  }

  async releaseSeats(reservationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('seat_reservations')
        .update({ status: SeatReservationStatus.RELEASED })
        .eq('id', reservationId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async getBookingsPaginated(
    userId: string,
    status?: string,
    page = PAGINATION.PAGE_OFFSET,
    limit = PAGINATION.PAGE_LIMIT,
  ): Promise<Booking[]> {
    try {
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
        throw error;
      }

      return keysToCamel(data || []) as Booking[];
    } catch (error) {
      throw error;
    }
  }
}

export const bookingsService = BookingsService.getInstance();
