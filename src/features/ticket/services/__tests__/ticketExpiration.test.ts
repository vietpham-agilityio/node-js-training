import {
  TicketExpirationService,
  ticketExpirationService,
} from '../ticketExpiration';
import { supabase } from '@/services/supabase/client';
import { BOOKING_STATUS } from '@/constants/status';

jest.mock('@/services/supabase/client', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(),
  },
}));

describe('TicketExpirationService', () => {
  let service: TicketExpirationService;
  const rpc = supabase.rpc as jest.Mock;
  const from = supabase.from as jest.Mock;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn(),
    single: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // Fake timers for interval tests
    service = TicketExpirationService.getInstance();
    from.mockReturnValue(mockQueryBuilder);
    rpc.mockResolvedValue({ data: 0, error: null });
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers
  });

  it('should be a singleton', () => {
    const instance1 = TicketExpirationService.getInstance();
    const instance2 = TicketExpirationService.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(ticketExpirationService);
  });

  describe('checkAndExpireTickets', () => {
    it('should call the trigger_expire_tickets RPC', async () => {
      rpc.mockResolvedValue({ data: 5, error: null });
      const count = await service.checkAndExpireTickets();
      expect(rpc).toHaveBeenCalledWith('trigger_expire_tickets');
      expect(count).toBe(5);
    });

    it('should return 0 if RPC fails', async () => {
      rpc.mockResolvedValue({ data: null, error: new Error('RPC Error') });
      const count = await service.checkAndExpireTickets();
      expect(count).toBe(0);
    });
  });

  describe('checkTicketStatus', () => {
    it('should return the current status of a ticket', async () => {
      const mockTicket = { id: 'ticket1', status: BOOKING_STATUS.ACTIVE };
      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockTicket,
        error: null,
      });

      const status = await service.checkTicketStatus('ticket1');

      expect(rpc).toHaveBeenCalledWith('trigger_expire_tickets'); // check first
      expect(from).toHaveBeenCalledWith('tickets');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'ticket1');
      expect(status).toBe(BOOKING_STATUS.ACTIVE);
    });

    it('should return EXPIRED if fetching fails', async () => {
      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: null,
        error: new Error('Fetch failed'),
      });
      const status = await service.checkTicketStatus('ticket1');
      expect(status).toBe(BOOKING_STATUS.EXPIRED);
    });
  });

  describe('getExpiredTickets', () => {
    it('should fetch expired tickets for a user', async () => {
      const mockExpired = [{ id: 'ticket1', status: BOOKING_STATUS.EXPIRED }];
      (mockQueryBuilder.order as jest.Mock).mockResolvedValue({
        data: mockExpired,
        error: null,
      });

      const tickets = await service.getExpiredTickets('user1');

      expect(rpc).toHaveBeenCalledWith('trigger_expire_tickets');
      expect(from).toHaveBeenCalledWith('tickets');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'booking.user_id',
        'user1',
      );
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'status',
        BOOKING_STATUS.EXPIRED,
      );
      expect(tickets).toEqual(mockExpired);
    });
  });

  describe('startPeriodicCheck', () => {
    it('should call checkAndExpireTickets immediately and then periodically', () => {
      const checkSpy = jest.spyOn(service, 'checkAndExpireTickets');
      const intervalMinutes = 5;

      const interval = service.startPeriodicCheck(intervalMinutes);

      // Should be called once immediately
      expect(checkSpy).toHaveBeenCalledTimes(1);

      // Fast-forward time by 5 minutes
      jest.advanceTimersByTime(intervalMinutes * 60 * 1000);
      expect(checkSpy).toHaveBeenCalledTimes(2);

      // Fast-forward time by another 5 minutes
      jest.advanceTimersByTime(intervalMinutes * 60 * 1000);
      expect(checkSpy).toHaveBeenCalledTimes(3);

      clearInterval(interval);
    });
  });

  describe('stopPeriodicCheck', () => {
    it('should clear the interval', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const interval = service.startPeriodicCheck(5);
      service.stopPeriodicCheck(interval);
      expect(clearIntervalSpy).toHaveBeenCalledWith(interval);
    });
  });
});
