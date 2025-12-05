import { ERROR_MESSAGES, MESSAGES, PAGINATION } from '@/constants';
import { Ticket, TicketStatus } from '@/types';
import { keysToCamel } from '@/utils';
import { supabase } from './client';

export class TicketsService {
  private static instance: TicketsService;

  private constructor() {}

  static getInstance(): TicketsService {
    if (!TicketsService.instance) {
      TicketsService.instance = new TicketsService();
    }
    return TicketsService.instance;
  }

  async getTickets(userId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select(
        `
        *,
        booking:bookings(
          *,
          showtime:showtimes(
            *,
            movie:movies(*),
            cinemaHall:cinema_halls(*, cinema:cinemas(*))
          )
        )
      `,
      )
      .eq('booking.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return keysToCamel(data) as Ticket[];
  }

  async getTicketById(ticketId: string): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .select(
        `
        *,
        booking:bookings(
          *,
          showtime:showtimes(
            *,
            movie:movies(*),
            cinemaHall:cinema_halls(*, cinema:cinemas(*))
          )
        )
      `,
      )
      .eq('id', ticketId)
      .single();

    if (error) throw error;
    return keysToCamel(data) as Ticket;
  }

  async validateTicket(qrData: string) {
    try {
      const data = JSON.parse(qrData);

      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*, booking:bookings(*)')
        .eq('id', data.ticketId)
        .eq('booking_id', data.bookingId)
        .single();

      if (error || !ticket) {
        return { valid: false, message: ERROR_MESSAGES.INVALID_TICKET };
      }

      if (ticket.scanned_at) {
        return {
          valid: false,
          message: ERROR_MESSAGES.TICKET_ALREADY_USED,
          scannedAt: ticket.scanned_at,
        };
      }

      if (ticket.status === TicketStatus.EXPIRED) {
        return { valid: false, message: ERROR_MESSAGES.TICKET_EXPIRED };
      }

      await supabase
        .from('tickets')
        .update({
          scanned_at: new Date().toISOString(),
          status: TicketStatus.USED,
        })
        .eq('id', ticket.id);

      return {
        valid: true,
        ticket,
        message: MESSAGES.TICKET_VALIDATED_SUCCESS,
      };
    } catch {
      return {
        valid: false,
        message: ERROR_MESSAGES.TICKET_INVALID_FORMAT,
      };
    }
  }

  async getTicketsPaginated(
    userId: string,
    page = PAGINATION.PAGE_OFFSET,
    limit = PAGINATION.PAGE_LIMIT_MAX,
  ): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select(
        `
        *,
        booking:bookings(
          *,
          showtime:showtimes(
            *,
            movie:movies(*),
            cinemaHall:cinema_halls(*, cinema:cinemas(*))
          )
        )
      `,
      )
      .eq('booking.user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return keysToCamel(data) as Ticket[];
  }
}

export const ticketsService = TicketsService.getInstance();
