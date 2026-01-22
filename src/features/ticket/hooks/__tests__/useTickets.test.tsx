import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { Effect } from 'effect';
import { ReactNode } from 'react';

import {
  useTicket,
  useTickets,
  useTicketsInfinite,
  useValidateTicket,
} from '../useTickets';

// Types
import { Ticket } from '@/features/booking/schemas/booking';

// Constants
import { BOOKING_STATUS, PAYMENT_STATUS } from '@/constants/status';
import { GENRE_MOVIE } from '@/constants/movie';

// Services
import { ticketsService } from '@/features/ticket/services/tickets';

jest.mock('@/features/ticket/services/tickets', () => ({
  ticketsService: {
    getTickets: jest.fn(),
    getTicketById: jest.fn(),
    getTicketsPaginated: jest.fn(),
    validateTicket: jest.fn(),
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

// Mock constants
jest.mock('@/constants', () => ({
  API_CONFIG: {
    BOOKING_STALE_TIME: 30000,
  },
  PAGINATION: {
    PAGE_OFFSET: 0,
    PAGE_LIMIT_MAX: 10,
  },
  queryKeys: {
    tickets: {
      all: ['tickets'],
      list: (userId?: string) => ['tickets', 'list', userId],
      lists: () => ['tickets', 'list'],
      detail: (id: string) => ['tickets', 'detail', id],
      infinite: (userId?: string) => ['tickets', 'infinite', userId],
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

// Mock ticket data
const mockTicket: Ticket = {
  id: 'ticket-1',
  bookingId: 'booking-1',
  seatNumber: 'A1',
  ticketNumber: 'TKT-001',
  qrCodeData: '{"booking_id":"booking-1","seat":"A1"}',
  price: 50000,
  status: BOOKING_STATUS.ACTIVE,
  scannedAt: undefined,
  createdAt: '2025-01-01T00:00:00Z',
  booking: {
    id: 'booking-1',
    userId: 'user-123',
    showtimeId: 'showtime-1',
    bookingNumber: 'BKG-001',
    bookingStatus: BOOKING_STATUS.USED,
    totalSeats: 1,
    seatNumbers: ['A1'],
    subtotal: 50000,
    discountAmount: 0,
    totalAmount: 50000,
    paymentMethod: 'wallet',
    paymentStatus: PAYMENT_STATUS.PAID,
    expiresAt: '2025-01-15T16:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    showtime: {
      id: 'showtime-1',
      showDate: '2025-01-15',
      showTime: '14:00',
      endTime: '16:00',
      price: 50000,
      movie: {
        id: 'movie-1',
        title: 'Test Movie',
        posterUrl: 'https://example.com/poster.jpg',
        genre: [GENRE_MOVIE.ACTION],
        durationMinutes: 120,
        rating: 8.5,
      },
      cinemaHall: {
        id: 'hall-1',
        name: 'Hall 1',
        hallType: 'Standard',
        cinema: {
          id: 'cinema-1',
          name: 'Test Cinema',
          city: 'Jakarta',
          address: '123 Test St',
        },
      },
    },
  },
} as unknown as Ticket;

describe('useTickets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserState = mockUser;
  });

  describe('useTickets hook', () => {
    it('should fetch tickets when user is authenticated', async () => {
      (ticketsService.getTickets as jest.Mock).mockReturnValue(
        Effect.succeed([mockTicket]),
      );

      const { result } = renderHook(() => useTickets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(ticketsService.getTickets).toHaveBeenCalledWith('user-123');
      expect(result.current.data).toEqual([mockTicket]);
    });

    it('should not fetch tickets when user is not authenticated', () => {
      mockUserState = null;

      const { result } = renderHook(() => useTickets(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(ticketsService.getTickets).not.toHaveBeenCalled();
    });

    it('should handle error when fetching tickets fails', async () => {
      const error = new Error('Failed to fetch tickets');
      (ticketsService.getTickets as jest.Mock).mockReturnValue(
        Effect.fail(error),
      );

      const { result } = renderHook(() => useTickets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });

    it('should return empty array when no tickets', async () => {
      (ticketsService.getTickets as jest.Mock).mockReturnValue(
        Effect.succeed([]),
      );

      const { result } = renderHook(() => useTickets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useTicketsInfinite hook', () => {
    it('should fetch paginated tickets', async () => {
      (ticketsService.getTicketsPaginated as jest.Mock).mockReturnValue(
        Effect.succeed([mockTicket]),
      );

      const { result } = renderHook(() => useTicketsInfinite(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(ticketsService.getTicketsPaginated).toHaveBeenCalledWith(
        'user-123',
        0,
        10,
      );
      expect(result.current.data?.pages[0]).toEqual([mockTicket]);
    });

    it('should not fetch when user is not authenticated', () => {
      mockUserState = null;

      const { result } = renderHook(() => useTicketsInfinite(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(ticketsService.getTicketsPaginated).not.toHaveBeenCalled();
    });

    it('should have next page when page is full', async () => {
      const fullPage = Array(10).fill(mockTicket);
      (ticketsService.getTicketsPaginated as jest.Mock).mockReturnValue(
        Effect.succeed(fullPage),
      );

      const { result } = renderHook(() => useTicketsInfinite(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.hasNextPage).toBe(true);
    });

    it('should not have next page when page is not full', async () => {
      const partialPage = Array(5).fill(mockTicket);
      (ticketsService.getTicketsPaginated as jest.Mock).mockReturnValue(
        Effect.succeed(partialPage),
      );

      const { result } = renderHook(() => useTicketsInfinite(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.hasNextPage).toBe(false);
    });

    it('should fetch next page correctly', async () => {
      const firstPage = Array(10).fill(mockTicket);
      const secondPage = Array(5).fill({ ...mockTicket, id: 'ticket-2' });

      (ticketsService.getTicketsPaginated as jest.Mock)
        .mockReturnValueOnce(Effect.succeed(firstPage))
        .mockReturnValueOnce(Effect.succeed(secondPage));

      const { result } = renderHook(() => useTicketsInfinite(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Fetch next page
      result.current.fetchNextPage();

      await waitFor(() => {
        expect(result.current.data?.pages.length).toBe(2);
      });

      expect(ticketsService.getTicketsPaginated).toHaveBeenCalledWith(
        'user-123',
        1,
        10,
      );
    });
  });

  describe('useTicket hook', () => {
    it('should fetch single ticket by ID', async () => {
      (ticketsService.getTicketById as jest.Mock).mockReturnValue(
        Effect.succeed(mockTicket),
      );

      const { result } = renderHook(() => useTicket('ticket-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(ticketsService.getTicketById).toHaveBeenCalledWith('ticket-1');
      expect(result.current.data).toEqual(mockTicket);
    });

    it('should not fetch when ticketId is empty', () => {
      const { result } = renderHook(() => useTicket(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(ticketsService.getTicketById).not.toHaveBeenCalled();
    });

    it('should handle error when fetching ticket fails', async () => {
      const error = new Error('Ticket not found');
      (ticketsService.getTicketById as jest.Mock).mockReturnValue(
        Effect.fail(error),
      );

      const { result } = renderHook(() => useTicket('invalid-id'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useValidateTicket hook', () => {
    const validQrData = JSON.stringify({
      booking_id: 'booking-1',
      seat: 'A1',
      timestamp: Date.now(),
    });

    it('should validate ticket successfully', async () => {
      (ticketsService.validateTicket as jest.Mock).mockReturnValue(
        Effect.succeed({
          valid: true,
          ticket: mockTicket,
          message: 'Ticket validated successfully',
        }),
      );

      const { result } = renderHook(() => useValidateTicket(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(validQrData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(ticketsService.validateTicket).toHaveBeenCalledWith(validQrData);
      expect(result.current.data?.valid).toBe(true);
    });

    it('should handle invalid ticket', async () => {
      (ticketsService.validateTicket as jest.Mock).mockReturnValue(
        Effect.succeed({
          valid: false,
          message: 'Invalid ticket',
        }),
      );

      const { result } = renderHook(() => useValidateTicket(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('invalid-qr-data');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.valid).toBe(false);
    });

    it('should handle already used ticket', async () => {
      (ticketsService.validateTicket as jest.Mock).mockReturnValue(
        Effect.succeed({
          valid: false,
          message: 'Ticket has already been used',
          scannedAt: '2025-01-01T10:00:00Z',
        }),
      );

      const { result } = renderHook(() => useValidateTicket(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(validQrData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.valid).toBe(false);
      expect(result.current.data?.scannedAt).toBeDefined();
    });

    it('should handle expired ticket', async () => {
      (ticketsService.validateTicket as jest.Mock).mockReturnValue(
        Effect.succeed({
          valid: false,
          message: 'Ticket has expired',
        }),
      );

      const { result } = renderHook(() => useValidateTicket(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(validQrData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.valid).toBe(false);
      expect(result.current.data?.message).toBe('Ticket has expired');
    });

    it('should handle validation error', async () => {
      const error = new Error('Network error');
      (ticketsService.validateTicket as jest.Mock).mockReturnValue(
        Effect.fail(error),
      );

      const { result } = renderHook(() => useValidateTicket(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(validQrData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });
});
