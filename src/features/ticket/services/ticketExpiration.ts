import { BOOKING_STATUS } from '@/constants/status';
import { BookingStatus } from '@/features/booking/schemas/booking';
import { supabase } from '@/services/supabase/client';
import { runEffectForQuery } from '@/utils/effect';
import { Effect } from 'effect';
import { TicketError } from '../error';

export class TicketExpirationService {
  private static instance: TicketExpirationService;

  private constructor() {}

  static getInstance(): TicketExpirationService {
    if (!TicketExpirationService.instance) {
      TicketExpirationService.instance = new TicketExpirationService();
    }
    return TicketExpirationService.instance;
  }

  /**
   * Check and expire tickets that have passed their expiration time
   * Call this when:
   * - App starts
   * - User views tickets list
   * - User views ticket details
   */
  checkAndExpireTickets = () =>
    Effect.tryPromise({
      try: async () => {
        // Call the database function to expire tickets
        const { data, error } = await supabase.rpc('trigger_expire_tickets');

        if (error) {
          throw error;
        }

        const expiredCount = data || 0;

        return expiredCount;
      },
      catch: (error: unknown) =>
        TicketError.ticketExpirationFailed(
          error instanceof Error ? error.message : '',
        ),
    });

  /**
   * Check if a specific ticket has expired
   * Returns the computed status
   */
  checkTicketStatus = (ticketId: string) =>
    Effect.tryPromise({
      try: async () => {
        // First, trigger expiration check
        await runEffectForQuery(this.checkAndExpireTickets());

        // Fetch ticket with booking and showtime
        const { data: ticket, error } = await supabase
          .from('tickets')
          .select(
            `
          *,
          booking:bookings!inner(
            expires_at,
            booking_status,
            showtime:showtimes!inner(
              show_date,
              show_time,
              end_time
            )
          )
        `,
          )
          .eq('id', ticketId)
          .single();

        if (error || !ticket) {
          return BOOKING_STATUS.EXPIRED as BookingStatus;
        }

        // Return current status from database
        return ticket.status as BookingStatus;
      },
      catch: (error: unknown) =>
        TicketError.ticketExpirationFailed(
          error instanceof Error ? error.message : '',
        ),
    });

  /**
   * Get all expired tickets for a user
   */
  getExpiredTickets = (userId: string) =>
    Effect.tryPromise({
      try: async () => {
        // First check for any newly expired tickets
        await runEffectForQuery(this.checkAndExpireTickets());

        const { data, error } = await supabase
          .from('tickets')
          .select(
            `
          *,
          booking:bookings!inner(
            booking_number,
            user_id,
            showtime:showtimes!inner(
              show_date,
              show_time,
              movie:movies(title)
            )
          )
        `,
          )
          .eq('booking.user_id', userId)
          .eq('status', 'expired')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      catch: (error: unknown) =>
        TicketError.ticketNetworkError(
          error instanceof Error ? error.message : '',
        ),
    });

  /**
   * Schedule periodic expiration check
   * Call this in app initialization
   */
  startPeriodicCheck(intervalMinutes: number = 5): NodeJS.Timeout {
    // Initial check
    runEffectForQuery(this.checkAndExpireTickets()).catch(() => {
      // Silently fail
    });

    // Schedule periodic checks
    const interval = setInterval(
      () => {
        runEffectForQuery(this.checkAndExpireTickets()).catch(() => {
          // Silently fail
        });
      },
      intervalMinutes * 60 * 1000,
    ) as unknown as NodeJS.Timeout;

    return interval;
  }

  /**
   * Stop periodic check
   */
  stopPeriodicCheck(interval: NodeJS.Timeout): void {
    clearInterval(interval);
  }
}

export const ticketExpirationService = TicketExpirationService.getInstance();
