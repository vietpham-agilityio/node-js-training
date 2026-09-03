// Schema
import { Ticket } from '@/features/booking/schemas/booking';

// Utils
import { keysToCamel } from '@/utils/convert';
import { runEffectForQuery } from '@/utils/effect';

// Constants
import { ERROR_MESSAGES, MESSAGES, PAGINATION } from '@/constants';
import { BOOKING_STATUS } from '@/constants/status';

// Supabase
import { supabase } from '@/services/supabase/client';

// Effect
import { Effect } from 'effect';
import { TicketError } from '../error';

export class TicketsService {
  private static instance: TicketsService;

  private constructor() {}

  static getInstance(): TicketsService {
    if (!TicketsService.instance) {
      TicketsService.instance = new TicketsService();
    }
    return TicketsService.instance;
  }

  getTickets = (userId: string) =>
    Effect.tryPromise({
      try: async () => {
        // First, expire any old tickets
        await runEffectForQuery(this.expireOldTickets());

        // Get all bookings for user first (RLS will filter automatically)
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id')
          .eq('user_id', userId);

        if (bookingsError) {
          throw bookingsError;
        }

        if (!bookings || bookings.length === 0) {
          return [];
        }

        const bookingIds = bookings.map(b => b.id);

        // Now get tickets for these bookings
        // Optimized: Only select needed fields
        const { data, error } = await supabase
          .from('tickets')
          .select(
            `
          id,
          booking_id,
          seat_number,
          ticket_number,
          qr_code_data,
          price,
          status,
          scanned_at,
          created_at,
          booking:bookings!inner(
            id,
            booking_number,
            booking_status,
            total_seats,
            seat_numbers,
            total_amount,
            created_at,
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
          )
        `,
          )
          .in('booking_id', bookingIds)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        return keysToCamel(data || []) as Ticket[];
      },
      catch: (error: unknown) =>
        TicketError.ticketNetworkError(
          error instanceof Error ? error.message : '',
        ),
    });

  /**
   * Get ticket by ID
   * Automatically checks for expiration first
   */
  getTicketById = (ticketId: string) =>
    Effect.tryPromise({
      try: async () => {
        // First, expire any old tickets
        await runEffectForQuery(this.expireOldTickets());

        const { data, error } = await supabase
          .from('tickets')
          .select(
            `
          id,
          booking_id,
          seat_number,
          ticket_number,
          qr_code_data,
          price,
          status,
          scanned_at,
          created_at,
          booking:bookings!inner(
            id,
            booking_number,
            booking_status,
            user_id,
            total_seats,
            seat_numbers,
            total_amount,
            payment_status,
            created_at,
            showtime:showtimes!inner(
              id,
              show_date,
              show_time,
              end_time,
              price,
              movie:movies!inner(
                id,
                title,
                synopsis,
                poster_url,
                genre,
                duration_minutes,
                rating,
                language
              ),
              cinema_hall:cinema_halls!inner(
                id,
                name,
                hall_type,
                total_seats,
                cinema:cinemas!inner(
                  id,
                  name,
                  city,
                  address,
                  phone_number
                )
              )
            )
          )
        `,
          )
          .eq('id', ticketId)
          .single();

        if (error) {
          throw TicketError.ticketNotFound(error.message);
        }

        return keysToCamel(data) as Ticket;
      },
      catch: (error: unknown) =>
        TicketError.ticketNotFound(error instanceof Error ? error.message : ''),
    });

  /**
   * Validate ticket QR code
   * Checks expiration before validation
   */
  validateTicket = (qrData: string) =>
    Effect.tryPromise({
      try: async () => {
        try {
          // First, expire any old tickets
          await runEffectForQuery(this.expireOldTickets());

          // Parse QR data
          let parsedData;
          try {
            parsedData = JSON.parse(qrData);
          } catch {
            return {
              valid: false,
              message: ERROR_MESSAGES.TICKET_INVALID_FORMAT,
            };
          }

          const { booking_id, seat } = parsedData;

          if (!booking_id || !seat) {
            return {
              valid: false,
              message: ERROR_MESSAGES.TICKET_INVALID_FORMAT,
            };
          }

          // Get ticket with booking info
          const { data: ticket, error } = await supabase
            .from('tickets')
            .select(
              `
          *,
          booking:bookings!inner(
            booking_status,
            expires_at
          )
        `,
            )
            .eq('booking_id', booking_id)
            .eq('seat_number', seat)
            .single();

          if (error || !ticket) {
            return { valid: false, message: ERROR_MESSAGES.INVALID_TICKET };
          }

          // Check if already scanned
          if (ticket.scanned_at) {
            return {
              valid: false,
              message: ERROR_MESSAGES.TICKET_ALREADY_USED,
              scannedAt: ticket.scanned_at,
            };
          }

          // Check if expired
          if (ticket.status === BOOKING_STATUS.EXPIRED) {
            return { valid: false, message: ERROR_MESSAGES.TICKET_EXPIRED };
          }

          // Check booking status
          if (ticket.booking.booking_status === BOOKING_STATUS.CANCELLED) {
            return { valid: false, message: 'Booking has been cancelled' };
          }

          // Update ticket as scanned
          const { error: updateError } = await supabase
            .from('tickets')
            .update({
              scanned_at: new Date().toISOString(),
              status: BOOKING_STATUS.USED,
            })
            .eq('id', ticket.id);

          if (updateError) {
            throw TicketError.ticketValidationFailed(updateError.message);
          }

          return {
            valid: true,
            ticket: keysToCamel(ticket),
            message: MESSAGES.TICKET_VALIDATED_SUCCESS,
          };
        } catch {
          return {
            valid: false,
            message: ERROR_MESSAGES.TICKET_VALIDATION_FAILED,
          };
        }
      },
      catch: (error: unknown) =>
        TicketError.ticketValidationFailed(
          error instanceof Error ? error.message : '',
        ),
    });

  /**
   * Get paginated tickets
   * Automatically checks for expired tickets first
   */
  getTicketsPaginated = (
    userId: string,
    page = PAGINATION.PAGE_OFFSET,
    limit = PAGINATION.PAGE_LIMIT_MAX,
  ) =>
    Effect.tryPromise({
      try: async () => {
        // First, expire any old tickets
        await runEffectForQuery(this.expireOldTickets());

        // Get bookings first (RLS filters automatically)
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id')
          .eq('user_id', userId);

        if (bookingsError) {
          throw bookingsError;
        }

        if (!bookings || bookings.length === 0) {
          return [];
        }

        const bookingIds = bookings.map(b => b.id);

        // Get paginated tickets
        const { data, error } = await supabase
          .from('tickets')
          .select(
            `
          id,
          booking_id,
          seat_number,
          ticket_number,
          qr_code_data,
          price,
          status,
          scanned_at,
          created_at,
          booking:bookings!inner(
            id,
            booking_number,
            total_seats,
            seat_numbers,
            created_at,
            showtime:showtimes!inner(
              id,
              show_date,
              show_time,
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
          )
        `,
          )
          .in('booking_id', bookingIds)
          .order('created_at', { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);

        if (error) {
          throw TicketError.ticketNetworkError(error.message);
        }

        return keysToCamel(data || []) as Ticket[];
      },
      catch: (error: unknown) =>
        TicketError.ticketNetworkError(
          error instanceof Error ? error.message : '',
        ),
    });

  /**
   * Helper method to call the database function
   */
  private expireOldTickets = () =>
    Effect.tryPromise({
      try: async () => {
        const { data, error } = await supabase.rpc('trigger_expire_tickets');

        if (error) {
          throw TicketError.ticketExpirationFailed(error.message);
        }

        const count = data || 0;

        return count;
      },
      catch: (error: unknown) =>
        TicketError.ticketExpirationFailed(
          error instanceof Error ? error.message : '',
        ),
    });
}

export const ticketsService = TicketsService.getInstance();
