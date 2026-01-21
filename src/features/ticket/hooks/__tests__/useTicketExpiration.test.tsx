import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

import { useTicketExpiration } from '../useTicketExpiration';

// Constants
import { BOOKING_STATUS } from '@/constants/status';

// Type
import { BookingStatus } from '@/features/booking/schemas/booking';

// Mock services
const mockCheckAndExpireTickets = jest.fn();
const mockCheckTicketStatus = jest.fn();
const mockStartPeriodicCheck = jest.fn();
const mockStopPeriodicCheck = jest.fn();

jest.mock('@/features/ticket/services/ticketExpiration', () => ({
  ticketExpirationService: {
    checkAndExpireTickets: () => mockCheckAndExpireTickets(),
    checkTicketStatus: (ticketId: string) => mockCheckTicketStatus(ticketId),
    startPeriodicCheck: (interval: number) => mockStartPeriodicCheck(interval),
    stopPeriodicCheck: (interval: NodeJS.Timeout) =>
      mockStopPeriodicCheck(interval),
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
    mockCheckAndExpireTickets.mockResolvedValue(0);
    mockCheckTicketStatus.mockResolvedValue(BOOKING_STATUS.ACTIVE);
    mockStartPeriodicCheck.mockReturnValue(123);
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
        expect(mockCheckAndExpireTickets).toHaveBeenCalled();
      });
    });

    it('should start periodic check on mount', async () => {
      renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockStartPeriodicCheck).toHaveBeenCalledWith(5);
      });
    });

    it('should not check tickets when user is not authenticated', () => {
      mockUserState = null;

      renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      expect(mockCheckAndExpireTickets).not.toHaveBeenCalled();
      expect(mockStartPeriodicCheck).not.toHaveBeenCalled();
    });

    it('should stop periodic check on unmount', async () => {
      const { unmount } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockStartPeriodicCheck).toHaveBeenCalled();
      });

      unmount();

      expect(mockStopPeriodicCheck).toHaveBeenCalledWith(123);
    });
  });

  describe('checkExpiredTickets', () => {
    it('should return 0 when no tickets expired', async () => {
      mockCheckAndExpireTickets.mockResolvedValue(0);

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
      mockCheckAndExpireTickets.mockResolvedValue(3);

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
      expect(mockCheckAndExpireTickets).not.toHaveBeenCalled();
    });

    it('should handle service error gracefully', async () => {
      mockCheckAndExpireTickets.mockRejectedValue(new Error('Service error'));

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
      mockCheckTicketStatus.mockResolvedValue(BOOKING_STATUS.ACTIVE);

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
      expect(mockCheckTicketStatus).toHaveBeenCalledWith('ticket-123');
    });

    it('should invalidate queries when ticket is expired', async () => {
      mockCheckTicketStatus.mockResolvedValue(BOOKING_STATUS.EXPIRED);

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
      mockCheckTicketStatus.mockResolvedValue(BOOKING_STATUS.ACTIVE);
      mockInvalidateQueries.mockClear();

      const { result } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      // Wait for initial mount effects to complete
      await waitFor(() => {
        expect(mockStartPeriodicCheck).toHaveBeenCalled();
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
      mockCheckTicketStatus.mockResolvedValue(BOOKING_STATUS.USED);

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
      mockCheckTicketStatus.mockRejectedValue(new Error('Service error'));

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
      const { rerender, unmount } = renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockStartPeriodicCheck).toHaveBeenCalledTimes(1);
      });

      // Simulate user change by unmounting and remounting
      unmount();
      expect(mockStopPeriodicCheck).toHaveBeenCalled();

      // Clear mocks for clean state
      mockStartPeriodicCheck.mockClear();
      mockCheckAndExpireTickets.mockClear();

      // Re-render with same user
      renderHook(() => useTicketExpiration(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockStartPeriodicCheck).toHaveBeenCalledTimes(1);
      });
    });
  });
});
