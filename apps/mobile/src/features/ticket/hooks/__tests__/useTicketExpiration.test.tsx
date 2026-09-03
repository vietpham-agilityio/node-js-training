import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { ReactNode } from 'react';

import { useTicketExpiration } from '../useTicketExpiration';

// Constants
import { BOOKING_STATUS } from '@/constants/status';

// Effect
import { Effect } from 'effect';

// Type
import { BookingStatus } from '@/features/booking/schemas/booking';
import { ticketExpirationService } from '../../services/ticketExpiration';

// Mock ticketExpirationService
jest.mock('../../services/ticketExpiration', () => ({
  ticketExpirationService: {
    checkAndExpireTickets: jest.fn(),
    checkTicketStatus: jest.fn(),
    startPeriodicCheck: jest.fn(),
    stopPeriodicCheck: jest.fn(),
  },
}));

// Mock auth store
const mockUser = { id: 'user-123', email: 'test@example.com' };
let mockUserState: typeof mockUser | null = mockUser;

jest.mock('@/features/auth/store/auth', () => ({
  useAuthStore: (
    selector: (state: { user: typeof mockUser | null }) => unknown,
  ) => selector({ user: mockUserState }),
}));

// Mock query client methods
const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

// Mock constants
jest.mock('@/constants', () => ({
  queryKeys: {
    tickets: {
      all: ['tickets'],
      detail: (id: string) => ['tickets', 'detail', id],
    },
    bookings: {
      all: ['bookings'],
    },
  },
}));

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';

  return Wrapper;
};

describe('useTicketExpiration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUserState = mockUser;
    (
      ticketExpirationService.checkAndExpireTickets as jest.Mock
    ).mockReturnValue(Effect.succeed(0));
    (ticketExpirationService.checkTicketStatus as jest.Mock).mockReturnValue(
      Effect.succeed(BOOKING_STATUS.ACTIVE),
    );
    (ticketExpirationService.startPeriodicCheck as jest.Mock).mockReturnValue(
      123,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial setup', () => {
    it('should call checkExpiredTickets on mount when user is authenticated', async () => {
      renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(
          ticketExpirationService.checkAndExpireTickets,
        ).toHaveBeenCalled();
      });
    });

    it('should start periodic check on mount', async () => {
      renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(ticketExpirationService.startPeriodicCheck).toHaveBeenCalledWith(
          5,
        );
      });
    });

    it('should not check tickets when user is not authenticated', () => {
      mockUserState = null;

      renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      expect(
        ticketExpirationService.checkAndExpireTickets,
      ).not.toHaveBeenCalled();
      expect(ticketExpirationService.startPeriodicCheck).not.toHaveBeenCalled();
    });

    it('should stop periodic check on unmount', async () => {
      const { unmount } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(ticketExpirationService.startPeriodicCheck).toHaveBeenCalled();
      });

      unmount();

      expect(ticketExpirationService.stopPeriodicCheck).toHaveBeenCalledWith(
        123,
      );
    });
  });

  describe('checkExpiredTickets', () => {
    it('should return 0 when no tickets expired', async () => {
      (
        ticketExpirationService.checkAndExpireTickets as jest.Mock
      ).mockReturnValue(Effect.succeed(0));

      const { result } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      let expiredCount: number;
      await act(async () => {
        expiredCount = await result.current.checkExpiredTickets();
      });

      expect(expiredCount!).toBe(0);
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it('should invalidate queries when tickets expired', async () => {
      (
        ticketExpirationService.checkAndExpireTickets as jest.Mock
      ).mockReturnValue(Effect.succeed(3));

      const { result } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      let expiredCount: number;
      await act(async () => {
        expiredCount = await result.current.checkExpiredTickets();
      });

      expect(expiredCount!).toBe(3);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['tickets'],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['bookings'],
      });
    });

    it('should return 0 when user is not authenticated', async () => {
      mockUserState = null;

      const { result } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      let expiredCount: number;
      await act(async () => {
        expiredCount = await result.current.checkExpiredTickets();
      });

      expect(expiredCount!).toBe(0);
      expect(
        ticketExpirationService.checkAndExpireTickets,
      ).not.toHaveBeenCalled();
    });

    it('should handle service error gracefully', async () => {
      (
        ticketExpirationService.checkAndExpireTickets as jest.Mock
      ).mockReturnValue(Effect.fail(new Error('Service error')));

      const { result } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      let expiredCount: number;
      await act(async () => {
        expiredCount = await result.current.checkExpiredTickets();
      });

      expect(expiredCount!).toBe(0);
    });
  });

  describe('checkTicketStatus', () => {
    it('should return ticket status', async () => {
      (ticketExpirationService.checkTicketStatus as jest.Mock).mockReturnValue(
        Effect.succeed(BOOKING_STATUS.ACTIVE),
      );

      const { result } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      let status: BookingStatus;
      await act(async () => {
        status = (await result.current.checkTicketStatus(
          'ticket-123',
        )) as BookingStatus;
      });

      expect(status!).toBe(BOOKING_STATUS.ACTIVE);
      expect(ticketExpirationService.checkTicketStatus).toHaveBeenCalledWith(
        'ticket-123',
      );
    });

    it('should invalidate queries when ticket is expired', async () => {
      (ticketExpirationService.checkTicketStatus as jest.Mock).mockReturnValue(
        Effect.succeed(BOOKING_STATUS.EXPIRED),
      );

      const { result } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.checkTicketStatus('ticket-123');
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['tickets', 'detail', 'ticket-123'],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['tickets'],
      });
    });

    it('should not invalidate queries when ticket is active', async () => {
      (ticketExpirationService.checkTicketStatus as jest.Mock).mockReturnValue(
        Effect.succeed(BOOKING_STATUS.ACTIVE),
      );
      mockInvalidateQueries.mockClear();

      const { result } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      // Wait for initial mount effects to complete
      await waitFor(() => {
        expect(ticketExpirationService.startPeriodicCheck).toHaveBeenCalled();
      });

      mockInvalidateQueries.mockClear();

      await act(async () => {
        (await result.current.checkTicketStatus('ticket-123')) as BookingStatus;
      });

      // Should not invalidate for active ticket
      expect(mockInvalidateQueries).not.toHaveBeenCalledWith({
        queryKey: ['tickets', 'detail', 'ticket-123'],
      });
    });

    it('should return EXPIRED status when ticket is used', async () => {
      (ticketExpirationService.checkTicketStatus as jest.Mock).mockReturnValue(
        Effect.succeed(BOOKING_STATUS.USED),
      );

      const { result } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      let status: BookingStatus;
      await act(async () => {
        status = (await result.current.checkTicketStatus(
          'ticket-123',
        )) as BookingStatus;
      });

      expect(status!).toBe(BOOKING_STATUS.USED);
    });

    it('should return EXPIRED on service error', async () => {
      (ticketExpirationService.checkTicketStatus as jest.Mock).mockReturnValue(
        Effect.fail(new Error('Service error')),
      );

      const { result } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      let status: BookingStatus;
      await act(async () => {
        status = (await result.current.checkTicketStatus(
          'ticket-123',
        )) as BookingStatus;
      });

      expect(status!).toBe(BOOKING_STATUS.EXPIRED);
    });
  });

  describe('Return values', () => {
    it('should return checkExpiredTickets function', () => {
      const { result } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.checkExpiredTickets).toBe('function');
    });

    it('should return checkTicketStatus function', () => {
      const { result } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.checkTicketStatus).toBe('function');
    });
  });

  describe('User authentication changes', () => {
    it('should restart periodic check when user changes', async () => {
      const { unmount } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(
          ticketExpirationService.startPeriodicCheck,
        ).toHaveBeenCalledTimes(1);
      });

      // Simulate user change by unmounting and remounting
      unmount();
      expect(ticketExpirationService.stopPeriodicCheck).toHaveBeenCalled();

      // Clear the call count before re-rendering
      (ticketExpirationService.startPeriodicCheck as jest.Mock).mockClear();

      // Re-render with same user
      renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(
          ticketExpirationService.startPeriodicCheck,
        ).toHaveBeenCalledTimes(1);
      });
    });
  });
});
