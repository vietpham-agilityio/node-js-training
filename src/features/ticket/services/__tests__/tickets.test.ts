import { ERROR_MESSAGES, MESSAGES } from '@/constants';
import { BOOKING_STATUS } from '@/constants/status';
import { supabase } from '@/services/supabase/client';
import { keysToCamel } from '@/utils/convert';
import { runEffectForQuery } from '@/utils/effect';
import { TicketsService, ticketsService } from '../tickets';

// --- Mock Query Builder Factory ---
const createMockQueryBuilder = () => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn(),
  then: jest.fn(),
});

const mockQueryBuilder = createMockQueryBuilder();

jest.mock('@/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => mockQueryBuilder),
    rpc: jest.fn(),
  },
}));

jest.unmock('@/utils/convert');

describe('TicketsService', () => {
  let service: TicketsService;
  const from = supabase.from as jest.Mock;
  const rpc = supabase.rpc as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = TicketsService.getInstance();

    // Reset mockQueryBuilder methods
    Object.values(mockQueryBuilder).forEach(mockFn => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockClear();
        if (
          mockFn !== mockQueryBuilder.single &&
          mockFn !== mockQueryBuilder.then
        ) {
          mockFn.mockReturnThis?.();
        }
      }
    });

    // Default implementations
    (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
      resolve({ data: [], error: null }),
    );
    (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });

    // Default RPC mock (expireOldTickets)
    rpc.mockResolvedValue({ data: 0, error: null });
  });

  it('should be a singleton', () => {
    const instance1 = TicketsService.getInstance();
    const instance2 = TicketsService.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(ticketsService);
  });

  describe('getTickets', () => {
    it('should fetch tickets for a user', async () => {
      const mockBookings = [{ id: 'booking1' }, { id: 'booking2' }];
      const mockTickets = [
        {
          id: 'ticket1',
          booking_id: 'booking1',
          seat_number: 'A1',
          status: 'active',
        },
      ];

      // Mock expireOldTickets RPC
      rpc.mockResolvedValueOnce({ data: 0, error: null });

      // Mock bookings query
      (mockQueryBuilder.then as jest.Mock)
        .mockImplementationOnce(resolve =>
          resolve({ data: mockBookings, error: null }),
        )
        .mockImplementationOnce(resolve =>
          resolve({ data: mockTickets, error: null }),
        );

      const tickets = await runEffectForQuery(service.getTickets('user1'));

      expect(rpc).toHaveBeenCalledWith('trigger_expire_tickets');
      expect(from).toHaveBeenCalledWith('bookings');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user1');
      expect(from).toHaveBeenCalledWith('tickets');
      expect(mockQueryBuilder.in).toHaveBeenCalledWith('booking_id', [
        'booking1',
        'booking2',
      ]);
      expect(tickets).toEqual(keysToCamel(mockTickets));
    });

    it('should return empty array if user has no bookings', async () => {
      rpc.mockResolvedValueOnce({ data: 0, error: null });
      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: [], error: null }),
      );

      const tickets = await runEffectForQuery(service.getTickets('user1'));

      expect(tickets).toEqual([]);
      expect(from).toHaveBeenCalledTimes(1); // Only bookings query
    });

    it('should throw an error if fetching bookings fails', async () => {
      const error = new Error('Database error');

      rpc.mockResolvedValueOnce({ data: 0, error: null });
      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(
        (_resolve, reject) => reject(error),
      );

      await expect(
        runEffectForQuery(service.getTickets('user1')),
      ).rejects.toThrow();
    });

    it('should call expireOldTickets before fetching', async () => {
      const expiredCount = 5;
      rpc.mockResolvedValueOnce({ data: expiredCount, error: null });
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: [], error: null }),
      );

      await runEffectForQuery(service.getTickets('user1'));

      expect(rpc).toHaveBeenCalledWith('trigger_expire_tickets');
    });
  });

  describe('getTicketById', () => {
    it('should fetch a single ticket by ID', async () => {
      const mockTicket = {
        id: 'ticket1',
        booking_id: 'booking1',
        seat_number: 'A1',
        ticket_number: 'TKT001',
        status: BOOKING_STATUS.ACTIVE,
      };

      rpc.mockResolvedValueOnce({ data: 0, error: null });
      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockTicket,
        error: null,
      });

      const ticket = await runEffectForQuery(service.getTicketById('ticket1'));

      expect(rpc).toHaveBeenCalledWith('trigger_expire_tickets');
      expect(from).toHaveBeenCalledWith('tickets');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'ticket1');
      expect(mockQueryBuilder.single).toHaveBeenCalled();
      expect(ticket).toEqual(keysToCamel(mockTicket));
    });

    it('should throw an error if ticket is not found', async () => {
      const error = new Error('Ticket not found');

      rpc.mockResolvedValueOnce({ data: 0, error: null });
      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      await expect(
        runEffectForQuery(service.getTicketById('nonexistent')),
      ).rejects.toThrow();
    });
  });

  describe('validateTicket', () => {
    it('should validate a valid ticket', async () => {
      const qrData = JSON.stringify({
        booking_id: 'booking1',
        seat: 'A1',
        timestamp: Date.now(),
      });

      const mockTicket = {
        id: 'ticket1',
        booking_id: 'booking1',
        seat_number: 'A1',
        status: BOOKING_STATUS.ACTIVE,
        scanned_at: null,
        booking: {
          booking_status: 'active',
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        },
      };

      rpc.mockResolvedValueOnce({ data: 0, error: null });
      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockTicket,
        error: null,
      });
      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: {}, error: null }),
      );

      const result = await runEffectForQuery(service.validateTicket(qrData));

      expect(result.valid).toBe(true);
      expect(result.message).toBe(MESSAGES.TICKET_VALIDATED_SUCCESS);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        scanned_at: expect.any(String),
        status: BOOKING_STATUS.USED,
      });
    });

    it('should reject invalid QR data format', async () => {
      const invalidQrData = 'invalid-json';

      rpc.mockResolvedValueOnce({ data: 0, error: null });

      const result = await runEffectForQuery(
        service.validateTicket(invalidQrData),
      );

      expect(result.valid).toBe(false);
      expect(result.message).toBe(ERROR_MESSAGES.TICKET_INVALID_FORMAT);
    });

    it('should reject QR data with missing fields', async () => {
      const qrData = JSON.stringify({ booking_id: 'booking1' }); // Missing seat

      rpc.mockResolvedValueOnce({ data: 0, error: null });

      const result = await runEffectForQuery(service.validateTicket(qrData));

      expect(result.valid).toBe(false);
      expect(result.message).toBe(ERROR_MESSAGES.TICKET_INVALID_FORMAT);
    });

    it('should reject already scanned ticket', async () => {
      const qrData = JSON.stringify({
        booking_id: 'booking1',
        seat: 'A1',
        timestamp: Date.now(),
      });

      const mockTicket = {
        id: 'ticket1',
        scanned_at: '2024-01-01T10:00:00Z',
        status: BOOKING_STATUS.USED,
      };

      rpc.mockResolvedValueOnce({ data: 0, error: null });
      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockTicket,
        error: null,
      });

      const result = await runEffectForQuery(service.validateTicket(qrData));

      expect(result.valid).toBe(false);
      expect(result.message).toBe(ERROR_MESSAGES.TICKET_ALREADY_USED);
      expect(result.scannedAt).toBe(mockTicket.scanned_at);
    });

    it('should reject expired ticket', async () => {
      const qrData = JSON.stringify({
        booking_id: 'booking1',
        seat: 'A1',
        timestamp: Date.now(),
      });

      const mockTicket = {
        id: 'ticket1',
        status: BOOKING_STATUS.EXPIRED,
        scanned_at: null,
      };

      rpc.mockResolvedValueOnce({ data: 0, error: null });
      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockTicket,
        error: null,
      });

      const result = await runEffectForQuery(service.validateTicket(qrData));

      expect(result.valid).toBe(false);
      expect(result.message).toBe(ERROR_MESSAGES.TICKET_EXPIRED);
    });

    it('should reject ticket with cancelled booking', async () => {
      const qrData = JSON.stringify({
        booking_id: 'booking1',
        seat: 'A1',
        timestamp: Date.now(),
      });

      const mockTicket = {
        id: 'ticket1',
        status: BOOKING_STATUS.ACTIVE,
        scanned_at: null,
        booking: {
          booking_status: 'cancelled',
        },
      };

      rpc.mockResolvedValueOnce({ data: 0, error: null });
      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockTicket,
        error: null,
      });

      const result = await runEffectForQuery(service.validateTicket(qrData));

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Booking has been cancelled');
    });

    it('should handle database errors gracefully', async () => {
      const qrData = JSON.stringify({
        booking_id: 'booking1',
        seat: 'A1',
        timestamp: Date.now(),
      });

      rpc.mockResolvedValueOnce({ data: 0, error: null });
      (mockQueryBuilder.single as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      const result = await runEffectForQuery(service.validateTicket(qrData));

      expect(result.valid).toBe(false);
      expect(result.message).toBe(ERROR_MESSAGES.TICKET_VALIDATION_FAILED);
    });
  });

  describe('getTicketsPaginated', () => {
    it('should fetch paginated tickets', async () => {
      const mockBookings = [{ id: 'booking1' }];
      const mockTickets = [
        { id: 'ticket1', booking_id: 'booking1' },
        { id: 'ticket2', booking_id: 'booking1' },
      ];

      rpc.mockResolvedValueOnce({ data: 0, error: null });
      (mockQueryBuilder.then as jest.Mock)
        .mockImplementationOnce(resolve =>
          resolve({ data: mockBookings, error: null }),
        )
        .mockImplementationOnce(resolve =>
          resolve({ data: mockTickets, error: null }),
        );

      const tickets = await runEffectForQuery(
        service.getTicketsPaginated('user1', 0, 10),
      );

      expect(from).toHaveBeenCalledWith('bookings');
      expect(from).toHaveBeenCalledWith('tickets');
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9);
      expect(tickets).toEqual(keysToCamel(mockTickets));
    });

    it('should calculate correct range for different pages', async () => {
      const mockBookings = [{ id: 'booking1' }];

      rpc.mockResolvedValue({ data: 0, error: null });
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: mockBookings, error: null }),
      );

      // Page 0, limit 10
      await runEffectForQuery(service.getTicketsPaginated('user1', 0, 10));
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9);

      // Page 1, limit 10
      await runEffectForQuery(service.getTicketsPaginated('user1', 1, 10));
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(10, 19);

      // Page 2, limit 20
      await runEffectForQuery(service.getTicketsPaginated('user1', 2, 20));
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(40, 59);
    });

    it('should return empty array if no bookings', async () => {
      rpc.mockResolvedValueOnce({ data: 0, error: null });
      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: [], error: null }),
      );

      const tickets = await runEffectForQuery(
        service.getTicketsPaginated('user1', 0, 10),
      );

      expect(tickets).toEqual([]);
    });
  });

  describe('expireOldTickets', () => {
    it('should call trigger_expire_tickets RPC', async () => {
      const expiredCount = 3;
      rpc.mockResolvedValueOnce({ data: expiredCount, error: null });
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: [], error: null }),
      );

      // Call any method that triggers expireOldTickets
      await runEffectForQuery(service.getTickets('user1'));

      expect(rpc).toHaveBeenCalledWith('trigger_expire_tickets');
    });

    it('should handle RPC errors gracefully', async () => {
      rpc.mockRejectedValueOnce(new Error('RPC failed'));
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: [], error: null }),
      );

      // Should throw - error is propagated
      await expect(
        runEffectForQuery(service.getTickets('user1')),
      ).rejects.toThrow();
    });

    it('should return empty array if RPC returns error', async () => {
      rpc.mockResolvedValueOnce({ data: null, error: new Error('RPC error') });
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: [], error: null }),
      );

      // Should not throw - continues with 0 expired, returns empty array
      const tickets = await runEffectForQuery(service.getTickets('user1'));
      expect(tickets).toEqual([]);
    });
  });
});
