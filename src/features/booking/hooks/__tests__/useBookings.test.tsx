import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

// Constants
import { queryKeys } from '@/constants';

// Hooks
import {
  useBooking,
  useBookings,
  useBookingsInfinite,
  useCancelBooking,
  useCreateBooking,
  useReleaseSeats,
  useReserveSeats,
} from '../useBookings';

// Types
import {
  Booking,
  BookingStatus,
  InfiniteBookingsData,
} from '@/features/booking/types/booking';
import { Showtime } from '@/features/booking/types/cinema';
import { Wallet } from '@/features/wallet/types/wallet';

// Mock dependencies
const mockGetBookings = jest.fn();
const mockGetBookingsPaginated = jest.fn();
const mockGetBookingById = jest.fn();
const mockCreateBooking = jest.fn();
const mockCancelBooking = jest.fn();
const mockReserveSeats = jest.fn();
const mockReleaseSeats = jest.fn();
const mockProcessPurchase = jest.fn();
const mockRefund = jest.fn();

jest.mock('@/features/booking/services/booking', () => ({
  bookingsService: {
    getBookings: (userId: string, status?: string) =>
      mockGetBookings(userId, status),
    getBookingsPaginated: (
      userId: string,
      status?: string,
      page?: number,
      limit?: number,
    ) => mockGetBookingsPaginated(userId, status, page, limit),
    getBookingById: (id: string) => mockGetBookingById(id),
    createBooking: (data: any) => mockCreateBooking(data),
    cancelBooking: (id: string) => mockCancelBooking(id),
    reserveSeats: (showtimeId: string, userId: string, seats: string[]) =>
      mockReserveSeats(showtimeId, userId, seats),
    releaseSeats: (reservationId: string) => mockReleaseSeats(reservationId),
  },
}));

jest.mock('@/features/wallet/services/wallet', () => ({
  walletService: {
    processPurchase: (
      walletId: string,
      amount: number,
      bookingId: string,
      description: string,
    ) => mockProcessPurchase(walletId, amount, bookingId, description),
    refund: (walletId: string, amount: number, bookingId: string) =>
      mockRefund(walletId, amount, bookingId),
  },
}));

const mockUser = { id: 'user1', email: 'test@example.com' };
let mockWallet = { id: 'wallet1', balance: 1000, userId: 'user1' };
const mockResetBooking = jest.fn();
const mockSetReservationId = jest.fn();

// Mock stores
const mockUseAuthStore = jest.fn();
const mockUseWalletStore = jest.fn();
const mockUseBookingStore = jest.fn();

jest.mock('@/features/auth/store/auth', () => ({
  useAuthStore: (selector: any) => mockUseAuthStore(selector),
}));

jest.mock('@/features/wallet/store/wallet', () => ({
  useWalletStore: (selector: any) => mockUseWalletStore(selector),
}));

jest.mock('@/features/booking/store/booking', () => ({
  useBookingStore: (selector: any) => mockUseBookingStore(selector),
}));

// Helper to setup store mocks
const setupStoreMocks = () => {
  mockUseAuthStore.mockImplementation((selector: any) => {
    if (selector) {
      return selector({ user: mockUser });
    }
    return { user: mockUser };
  });

  mockUseWalletStore.mockImplementation((selector: any) => {
    if (selector) {
      return selector({ wallet: mockWallet });
    }
    return { wallet: mockWallet };
  });

  mockUseBookingStore.mockImplementation((selector: any) => {
    const store = {
      reset: mockResetBooking,
      setReservationId: mockSetReservationId,
    };
    if (selector) {
      return selector(store);
    }
    return store;
  });
};

// Helper to create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';

  return Wrapper;
};

describe('useBookings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStoreMocks();
  });

  it('should fetch bookings when user exists', async () => {
    const mockBookings: Booking[] = [
      {
        id: '1',
        userId: 'user1',
        showtimeId: 'showtime1',
        bookingNumber: 'BK001',
        totalSeats: 2,
        seatNumbers: ['A1', 'A2'],
        subtotal: 100,
        discountAmount: 0,
        totalAmount: 100,
        paymentMethod: 'wallet',
        paymentStatus: 'paid' as any,
        bookingStatus: BookingStatus.ACTIVE,
        expiresAt: '2024-01-02',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];
    mockGetBookings.mockResolvedValue(mockBookings);

    const { result } = renderHook(() => useBookings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetBookings).toHaveBeenCalledWith('user1', undefined);
    expect(result.current.data).toEqual(mockBookings);
  });

  it('should fetch bookings with status filter', async () => {
    const mockBookings: Booking[] = [];
    mockGetBookings.mockResolvedValue(mockBookings);

    const { result } = renderHook(() => useBookings('active'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetBookings).toHaveBeenCalledWith('user1', 'active');
  });

  it('should not fetch when user is not available', () => {
    mockUseAuthStore.mockImplementation((selector: any) => {
      if (selector) {
        return selector({ user: null });
      }
      return { user: null };
    });

    renderHook(() => useBookings(), {
      wrapper: createWrapper(),
    });

    expect(mockGetBookings).not.toHaveBeenCalled();
  });
});

describe('useBookingsInfinite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStoreMocks();
  });

  it('should return next page number when last page has PAGE_LIMIT items (covers line 66)', async () => {
    const fullPage: Booking[] = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      userId: 'user1',
      showtimeId: 'showtime1',
      bookingNumber: `BK${i + 1}`,
      totalSeats: 1,
      seatNumbers: ['A1'],
      subtotal: 50,
      discountAmount: 0,
      totalAmount: 50,
      paymentMethod: 'wallet',
      paymentStatus: 'paid' as any,
      bookingStatus: BookingStatus.ACTIVE,
      expiresAt: '2024-01-02',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }));
    mockGetBookingsPaginated.mockResolvedValue(fullPage);

    const { result } = renderHook(() => useBookingsInfinite(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // When page has exactly PAGE_LIMIT items, hasNextPage should be true
    // This means getNextPageParam returned allPages.length (line 66)
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.data?.pages[0].length).toBe(20);
  });

  it('should return undefined for nextPageParam when last page has fewer items', async () => {
    const mockBookings: Booking[] = [{ id: '1' } as Booking]; // Less than page limit
    mockGetBookingsPaginated.mockResolvedValue(mockBookings);

    const { result } = renderHook(() => useBookingsInfinite(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.hasNextPage).toBe(false);
  });

  it('should return next page number when last page has PAGE_LIMIT items (covers line 66)', async () => {
    // Create a page with exactly PAGE_LIMIT (20) items to trigger the return allPages.length branch
    const fullPage: Booking[] = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      userId: 'user1',
      showtimeId: 'showtime1',
      bookingNumber: `BK${i + 1}`,
      totalSeats: 1,
      seatNumbers: ['A1'],
      subtotal: 50,
      discountAmount: 0,
      totalAmount: 50,
      paymentMethod: 'wallet',
      paymentStatus: 'paid' as any,
      bookingStatus: BookingStatus.ACTIVE,
      expiresAt: '2024-01-02',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }));
    mockGetBookingsPaginated.mockResolvedValue(fullPage);

    const { result } = renderHook(() => useBookingsInfinite(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // When page has exactly PAGE_LIMIT items, hasNextPage should be true
    // This means getNextPageParam returned allPages.length (line 66)
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.data?.pages[0].length).toBe(20);
  });
});

describe('useBooking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStoreMocks();
  });

  it('should fetch booking by id when id is provided', async () => {
    const mockBooking: Booking = {
      id: '1',
      userId: 'user1',
      showtimeId: 'showtime1',
      bookingNumber: 'BK001',
      totalSeats: 2,
      seatNumbers: ['A1'],
      subtotal: 100,
      discountAmount: 0,
      totalAmount: 100,
      paymentMethod: 'wallet',
      paymentStatus: 'paid' as any,
      bookingStatus: BookingStatus.ACTIVE,
      expiresAt: '2024-01-02',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };
    mockGetBookingById.mockResolvedValue(mockBooking);

    const { result } = renderHook(() => useBooking('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetBookingById).toHaveBeenCalledWith('1');
    expect(result.current.data).toEqual(mockBooking);
  });

  it('should not fetch when id is empty', () => {
    renderHook(() => useBooking(''), {
      wrapper: createWrapper(),
    });

    expect(mockGetBookingById).not.toHaveBeenCalled();
  });

  it('should not fetch when id is null', () => {
    renderHook(() => useBooking(null as any), {
      wrapper: createWrapper(),
    });

    expect(mockGetBookingById).not.toHaveBeenCalled();
  });

  it('should not fetch when id is undefined', () => {
    renderHook(() => useBooking(undefined as any), {
      wrapper: createWrapper(),
    });

    expect(mockGetBookingById).not.toHaveBeenCalled();
  });
});

describe('useCreateBooking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Reset wallet to default
    mockWallet = { id: 'wallet1', balance: 1000, userId: 'user1' };
    setupStoreMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    // Reset wallet to default
    mockWallet = { id: 'wallet1', balance: 1000, userId: 'user1' };
    setupStoreMocks();
  });

  it('should create booking and process purchase when wallet balance is sufficient', async () => {
    const mockBooking: Booking = {
      id: 'booking1',
      userId: 'user1',
      showtimeId: 'showtime1',
      bookingNumber: 'BK001',
      totalSeats: 2,
      seatNumbers: ['A1', 'A2'],
      subtotal: 100,
      discountAmount: 0,
      totalAmount: 50,
      paymentMethod: 'wallet',
      paymentStatus: 'paid' as any,
      bookingStatus: BookingStatus.ACTIVE,
      expiresAt: '2024-01-02',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    mockCreateBooking.mockResolvedValue(mockBooking);
    mockProcessPurchase.mockResolvedValue(undefined);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateBooking(), {
      wrapper,
    });

    const bookingData = {
      userId: 'user1',
      showtimeId: 'showtime1',
      seats: ['A1', 'A2'],
      totalAmount: 50,
    };

    act(() => {
      result.current.mutate(bookingData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockCreateBooking).toHaveBeenCalledWith(bookingData);
    expect(mockProcessPurchase).toHaveBeenCalledWith(
      'wallet1',
      50,
      'booking1',
      'Ticket purchase - Booking #BK001',
    );
    expect(mockResetBooking).toHaveBeenCalled();
  });

  it('should throw error when wallet balance is insufficient', async () => {
    // Temporarily set wallet with low balance
    const lowBalanceWallet = { id: 'wallet1', balance: 10, userId: 'user1' };
    mockUseWalletStore.mockImplementation((selector: any) => {
      if (selector) {
        return selector({ wallet: lowBalanceWallet });
      }
      return { wallet: lowBalanceWallet };
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateBooking(), {
      wrapper,
    });

    const bookingData = {
      userId: 'user1',
      showtimeId: 'showtime1',
      seats: ['A1'],
      totalAmount: 100,
    };

    act(() => {
      result.current.mutate(bookingData);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Insufficient wallet balance');
    expect(mockCreateBooking).not.toHaveBeenCalled();
  });

  it('should throw error when wallet is not available', async () => {
    // Temporarily set wallet to null
    mockUseWalletStore.mockImplementation((selector: any) => {
      if (selector) {
        return selector({ wallet: null });
      }
      return { wallet: null };
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateBooking(), {
      wrapper,
    });

    const bookingData = {
      userId: 'user1',
      showtimeId: 'showtime1',
      seats: ['A1'],
      totalAmount: 100,
    };

    act(() => {
      result.current.mutate(bookingData);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Insufficient wallet balance');
  });

  it('should handle bookings list being null in optimistic update (covers line 146)', async () => {
    const mockBooking: Booking = {
      id: 'booking1',
      userId: 'user1',
      showtimeId: 'showtime1',
      bookingNumber: 'BK001',
      totalSeats: 2,
      seatNumbers: ['A1', 'A2'],
      subtotal: 100,
      discountAmount: 0,
      totalAmount: 100,
      paymentMethod: 'wallet',
      paymentStatus: 'paid' as any,
      bookingStatus: BookingStatus.ACTIVE,
      expiresAt: '2024-01-02',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    mockCreateBooking.mockResolvedValue(mockBooking);
    mockProcessPurchase.mockResolvedValue(undefined);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    // Don't set bookings list data - it will be null
    queryClient.setQueryData(queryKeys.wallet.detail('user1'), mockWallet);

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateBooking(), {
      wrapper: Wrapper,
    });

    const bookingData = {
      userId: 'user1',
      showtimeId: 'showtime1',
      seats: ['A1', 'A2'],
      totalAmount: 100,
    };

    act(() => {
      result.current.mutate(bookingData);
    });

    // The optimistic update should return early when bookings list is null (line 146)
    // Check that bookings list remains null/undefined
    const bookingsData = queryClient.getQueryData(
      queryKeys.bookings.list('user1', undefined),
    );
    expect(bookingsData).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle infinite query being null in optimistic update (covers line 176)', async () => {
    const existingBookings: Booking[] = [
      {
        id: 'existing1',
        userId: 'user1',
        showtimeId: 'showtime1',
        bookingNumber: 'BK000',
        totalSeats: 1,
        seatNumbers: ['B1'],
        subtotal: 50,
        discountAmount: 0,
        totalAmount: 50,
        paymentMethod: 'wallet',
        paymentStatus: 'paid' as any,
        bookingStatus: BookingStatus.ACTIVE,
        expiresAt: '2024-01-02',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];

    const mockBooking: Booking = {
      id: 'booking1',
      userId: 'user1',
      showtimeId: 'showtime1',
      bookingNumber: 'BK001',
      totalSeats: 2,
      seatNumbers: ['A1', 'A2'],
      subtotal: 100,
      discountAmount: 0,
      totalAmount: 100,
      paymentMethod: 'wallet',
      paymentStatus: 'paid' as any,
      bookingStatus: BookingStatus.ACTIVE,
      expiresAt: '2024-01-02',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    mockCreateBooking.mockResolvedValue(mockBooking);
    mockProcessPurchase.mockResolvedValue(undefined);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    queryClient.setQueryData(
      queryKeys.bookings.list('user1', undefined),
      existingBookings,
    );
    queryClient.setQueryData(queryKeys.wallet.detail('user1'), mockWallet);
    // Don't set infinite query data - it will be null

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateBooking(), {
      wrapper: Wrapper,
    });

    const bookingData = {
      userId: 'user1',
      showtimeId: 'showtime1',
      seats: ['A1', 'A2'],
      totalAmount: 100,
    };

    act(() => {
      result.current.mutate(bookingData);
    });

    // The optimistic update should return early when infinite query is null (line 176)
    const infiniteData = queryClient.getQueryData(
      queryKeys.bookings.infinite('user1', undefined),
    );
    expect(infiniteData).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle infinite query without pages in optimistic update (covers line 176)', async () => {
    const existingBookings: Booking[] = [
      {
        id: 'existing1',
        userId: 'user1',
        showtimeId: 'showtime1',
        bookingNumber: 'BK000',
        totalSeats: 1,
        seatNumbers: ['B1'],
        subtotal: 50,
        discountAmount: 0,
        totalAmount: 50,
        paymentMethod: 'wallet',
        paymentStatus: 'paid' as any,
        bookingStatus: BookingStatus.ACTIVE,
        expiresAt: '2024-01-02',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];

    const mockBooking: Booking = {
      id: 'booking1',
      userId: 'user1',
      showtimeId: 'showtime1',
      bookingNumber: 'BK001',
      totalSeats: 2,
      seatNumbers: ['A1', 'A2'],
      subtotal: 100,
      discountAmount: 0,
      totalAmount: 100,
      paymentMethod: 'wallet',
      paymentStatus: 'paid' as any,
      bookingStatus: BookingStatus.ACTIVE,
      expiresAt: '2024-01-02',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    mockCreateBooking.mockResolvedValue(mockBooking);
    mockProcessPurchase.mockResolvedValue(undefined);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    queryClient.setQueryData(
      queryKeys.bookings.list('user1', undefined),
      existingBookings,
    );
    queryClient.setQueryData(queryKeys.wallet.detail('user1'), mockWallet);
    // Set infinite query data but without pages property
    queryClient.setQueryData(
      queryKeys.bookings.infinite('user1', undefined),
      {} as InfiniteBookingsData,
    );

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateBooking(), {
      wrapper: Wrapper,
    });

    const bookingData = {
      userId: 'user1',
      showtimeId: 'showtime1',
      seats: ['A1', 'A2'],
      totalAmount: 100,
    };

    act(() => {
      result.current.mutate(bookingData);
    });

    // The optimistic update should return early when infinite query doesn't have pages (line 176)
    const infiniteData = queryClient.getQueryData(
      queryKeys.bookings.infinite('user1', undefined),
    ) as InfiniteBookingsData;
    expect(infiniteData?.pages).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should call resetBooking on success (covers line 245)', async () => {
    const mockBooking: Booking = {
      id: 'booking1',
      userId: 'user1',
      showtimeId: 'showtime1',
      bookingNumber: 'BK001',
      totalSeats: 2,
      seatNumbers: ['A1', 'A2'],
      subtotal: 100,
      discountAmount: 0,
      totalAmount: 50,
      paymentMethod: 'wallet',
      paymentStatus: 'paid' as any,
      bookingStatus: BookingStatus.ACTIVE,
      expiresAt: '2024-01-02',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    mockCreateBooking.mockResolvedValue(mockBooking);
    mockProcessPurchase.mockResolvedValue(undefined);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateBooking(), {
      wrapper,
    });

    const bookingData = {
      userId: 'user1',
      showtimeId: 'showtime1',
      seats: ['A1', 'A2'],
      totalAmount: 50,
    };

    act(() => {
      result.current.mutate(bookingData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify resetBooking was called (line 245)
    expect(mockResetBooking).toHaveBeenCalledTimes(1);
  });
});

describe('useCancelBooking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStoreMocks();
  });

  it('should cancel booking and refund wallet', async () => {
    mockCancelBooking.mockResolvedValue(undefined);
    mockRefund.mockResolvedValue(undefined);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCancelBooking(), {
      wrapper,
    });

    act(() => {
      result.current.mutate({ bookingId: 'booking1', amount: 100 });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockCancelBooking).toHaveBeenCalledWith('booking1');
    expect(mockRefund).toHaveBeenCalledWith('wallet1', 100, 'booking1');
  });

  it('should not refund when wallet is not available', async () => {
    // Temporarily set wallet to null
    mockUseWalletStore.mockImplementation((selector: any) => {
      if (selector) {
        return selector({ wallet: null });
      }
      return { wallet: null };
    });

    mockCancelBooking.mockResolvedValue(undefined);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCancelBooking(), {
      wrapper,
    });

    act(() => {
      result.current.mutate({ bookingId: 'booking1', amount: 100 });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockCancelBooking).toHaveBeenCalledWith('booking1');
    expect(mockRefund).not.toHaveBeenCalled();
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  setupStoreMocks();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

beforeEach(() => {
  jest.clearAllMocks();
  setupStoreMocks();
});

describe('useReleaseSeats', () => {
  it('should release seats and clear reservation', async () => {
    mockReleaseSeats.mockResolvedValue(undefined);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useReleaseSeats(), {
      wrapper,
    });

    act(() => {
      result.current.mutate('reservation1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockReleaseSeats).toHaveBeenCalledWith('reservation1');
    expect(mockSetReservationId).toHaveBeenCalledWith(null);
  });
});
