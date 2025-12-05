import {
  Booking,
  BookingStatus,
  PaymentStatus,
  SeatReservation,
  SeatReservationStatus,
  TicketStatus,
} from '@/types';
import { keysToCamel } from '@/utils';
import { supabase } from './client';
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
    let query = supabase
      .from('bookings')
      .select(
        `
        *,
        showtime:showtimes(
          *,
          movie:movies(*),
          cinemaHall:cinema_halls(*, cinema:cinemas(*))
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('booking_status', status);

    const { data, error } = await query;
    if (error) throw error;
    return keysToCamel(data) as Booking[];
  }

  async getBookingById(bookingId: string): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .select(
        `
        *,
        showtime:showtimes(
          *,
          movie:movies(*),
          cinemaHall:cinema_halls(*, cinema:cinemas(*))
        ),
        tickets(*)
      `,
      )
      .eq('id', bookingId)
      .single();
    if (error) throw error;
    return keysToCamel(data) as Booking;
  }

  async createBooking(data: CreateBookingData): Promise<Booking> {
    const bookingNumber = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: data.userId,
        showtime_id: data.showtimeId,
        booking_number: bookingNumber,
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

    if (bookingError) throw bookingError;

    // Create tickets
    const ticketPromises = data.seats.map(seat => {
      const ticketNumber = `TKT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(
        Math.random() * 1000000,
      )
        .toString()
        .padStart(6, '0')}`;
      const qrData = JSON.stringify({
        booking_id: booking.id,
        seat,
        timestamp: Date.now(),
      });

      return supabase.from('tickets').insert({
        booking_id: booking.id,
        seat_number: seat,
        ticket_number: ticketNumber,
        qr_code_data: qrData,
        price: data.totalAmount / data.seats.length,
        status: TicketStatus.ACTIVE,
      });
    });

    await Promise.all(ticketPromises);

    // Update available seats
    await supabase.rpc('decrement_available_seats', {
      showtime_id: data.showtimeId,
      seats_count: data.seats.length,
    });

    return keysToCamel(data) as Booking;
  }

  async cancelBooking(bookingId: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ booking_status: BookingStatus.CANCELLED })
      .eq('id', bookingId);
    if (error) throw error;

    await supabase
      .from('tickets')
      .update({ status: TicketStatus.CANCELLED })
      .eq('booking_id', bookingId);
  }

  async reserveSeats(
    showtimeId: string,
    userId: string,
    seats: string[],
  ): Promise<SeatReservation> {
    const reservedUntil = new Date();
    reservedUntil.setMinutes(reservedUntil.getMinutes() + 10);

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

    if (error) throw error;
    return keysToCamel(data) as SeatReservation;
  }

  async releaseSeats(reservationId: string) {
    const { error } = await supabase
      .from('seat_reservations')
      .update({ status: SeatReservationStatus.RELEASED })
      .eq('id', reservationId);
    if (error) throw error;
  }

  async getBookingsPaginated(
    userId: string,
    status?: string,
    page = PAGINATION.PAGE_OFFSET,
    limit = PAGINATION.PAGE_LIMIT,
  ): Promise<Booking[]> {
    let query = supabase
      .from('bookings')
      .select(
        `
        *,
        showtime:showtimes(
          *,
          movie:movies(*),
          cinemaHall:cinema_halls(*, cinema:cinemas(*))
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (status) query = query.eq('booking_status', status);

    const { data, error } = await query;
    if (error) throw error;
    return keysToCamel(data) as Booking[];
  }
}

export const bookingsService = BookingsService.getInstance();
