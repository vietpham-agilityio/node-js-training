import { TicketStatus } from '@/features/booking/types/booking';
import { supabase } from '@/services/supabase/client';

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
  async checkAndExpireTickets(): Promise<number> {
    try {
      // Call the database function to expire tickets
      const { data, error } = await supabase.rpc('trigger_expire_tickets');

      if (error) {
        throw error;
      }

      const expiredCount = data || 0;

      return expiredCount;
    } catch {
      return 0;
    }
  }

  /**
   * Check if a specific ticket has expired
   * Returns the computed status
   */
  async checkTicketStatus(ticketId: string): Promise<TicketStatus> {
    try {
      // First, trigger expiration check
      await this.checkAndExpireTickets();

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
        return TicketStatus.EXPIRED;
      }

      // Return current status from database
      return ticket.status as TicketStatus;
    } catch {
      return TicketStatus.EXPIRED;
    }
  }

  /**
   * Get all expired tickets for a user
   */
  async getExpiredTickets(userId: string) {
    try {
      // First check for any newly expired tickets
      await this.checkAndExpireTickets();

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
    } catch {
      return [];
    }
  }

  /**
   * Schedule periodic expiration check
   * Call this in app initialization
   */
  startPeriodicCheck(intervalMinutes: number = 5): NodeJS.Timeout {
    // Initial check
    this.checkAndExpireTickets();

    // Schedule periodic checks
    const interval = setInterval(
      () => {
        this.checkAndExpireTickets();
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
