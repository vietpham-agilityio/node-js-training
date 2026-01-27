import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

// Effect
import { Effect } from 'effect';

// Utils
import { generateUUIDSync } from '@/utils/uuid';
import { runEffectForQuery } from '@/utils/effect';

// Constant
import { API_CONFIG, PAGINATION, queryKeys } from '@/constants';
import { BOOKING_STATUS } from '@/constants/status';

// Services
import { CreateBookingData } from '@/features/booking/services/booking';
import { walletService } from '@/features/wallet/services/wallet';

// Effect Services
import { BookingService } from '@/features/booking/effect/services/booking';
import { BookingServiceLayer } from '@/features/booking/effect/layer/booking';

// Stores
import { useAuthStore } from '@/features/auth/store/auth';
import { useBookingStore } from '@/features/booking/store/booking';
import { useWalletStore } from '@/features/wallet/store/wallet';

// Types
import {
  Booking,
  InfiniteBookingsData,
} from '@/features/booking/schemas/booking';
import { Showtime } from '@/features/booking/schemas/cinema';
import { Wallet } from '@/features/wallet/schemas/wallet';

export const useBookings = (status?: string) => {
  const user = useAuthStore(state => state.user);

  return useQuery({
    queryKey: queryKeys.bookings.list(user?.id, status),
    queryFn: () =>
      runEffectForQuery(
        Effect.gen(function* () {
          const bookingService = yield* BookingService;
          return yield* bookingService.getBookings(user!.id, status);
        }),
        BookingServiceLayer,
      ),
    enabled: !!user,
    staleTime: API_CONFIG.BOOKING_STALE_TIME,
    gcTime: API_CONFIG.QUERY_STALE_TIME,
    retry: 2,

    // Exponential backoff retry strategy
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useBookingsInfinite = (status?: string) => {
  const user = useAuthStore(state => state.user);

  return useInfiniteQuery({
    // Cache key scoped by user + status
    queryKey: queryKeys.bookings.infinite(user?.id, status),
    queryFn: ({ pageParam = PAGINATION.PAGE_OFFSET }) =>
      runEffectForQuery(
        Effect.gen(function* () {
          const bookingService = yield* BookingService;
          return yield* bookingService.getBookingsPaginated(
            user!.id,
            status,
            pageParam,
            PAGINATION.PAGE_LIMIT,
          );
        }),
        BookingServiceLayer,
      ),
    getNextPageParam: (lastPage, allPages) => {
      // If last page has fewer items than page size, we've reached the end
      if (lastPage.length < PAGINATION.PAGE_LIMIT) return undefined;
      // Return next page number
      return allPages.length;
    },

    initialPageParam: PAGINATION.PAGE_OFFSET,
    enabled: !!user,
    staleTime: API_CONFIG.BOOKING_STALE_TIME,
    gcTime: API_CONFIG.QUERY_STALE_TIME,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Mobile optimization
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

export const useBooking = (bookingId: string) => {
  return useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: () =>
      runEffectForQuery(
        Effect.gen(function* () {
          const bookingService = yield* BookingService;
          return yield* bookingService.getBookingById(bookingId);
        }),
        BookingServiceLayer,
      ),
    enabled: !!bookingId,
    staleTime: API_CONFIG.BOOKING_STALE_TIME,
    gcTime: API_CONFIG.QUERY_STALE_TIME,
    retry: 2,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const wallet = useWalletStore(state => state.wallet);
  const resetBooking = useBookingStore(state => state.reset);

  return useMutation({
    mutationFn: async (data: Omit<CreateBookingData, 'walletId'>) => {
      if (!wallet) throw new Error('Wallet not found');
      // Prevent booking if wallet balance is insufficient
      if (wallet.balance < data.totalAmount) {
        throw new Error('Insufficient wallet balance');
      }

      // Create booking
      const booking = await runEffectForQuery(
        Effect.gen(function* () {
          const bookingService = yield* BookingService;
          return yield* bookingService.createBooking({
            ...data,
            walletId: wallet.id,
          });
        }),
        BookingServiceLayer,
      );

      return booking;
    },
    onMutate: async newBooking => {
      /**
       * Cancel ongoing queries to avoid race conditions
       */
      await queryClient.cancelQueries({
        queryKey: queryKeys.bookings.lists(),
      });

      await queryClient.cancelQueries({
        queryKey: queryKeys.wallet.detail(user?.id),
      });

      // Snapshot previous values
      const previousBookings = queryClient.getQueryData(
        queryKeys.bookings.list(user?.id),
      );

      const previousWallet = queryClient.getQueryData(
        queryKeys.wallet.detail(user?.id),
      );

      /**
       * Optimistically add booking to normal list
       */
      queryClient.setQueryData(
        queryKeys.bookings.list(user?.id),
        (old: Booking[]) => {
          if (!old) return old;

          const optimisticBooking = {
            id: generateUUIDSync(), // temporary ID
            ...newBooking,
            bookingNumber: generateUUIDSync(),
            bookingStatus: BOOKING_STATUS.ACTIVE,
            createdAt: new Date().toISOString(),
          };

          // New bookings appear at top
          return [optimisticBooking, ...old];
        },
      );

      /**
       * Optimistically update INFINITE QUERY
       *
       * pages structure:
       * [
       *   [booking1, booking2], // page 0 (newest)
       *   [booking3, booking4], // page 1
       * ]
       *
       * We ONLY insert into page 0
       * slice(1) keeps page 1..n unchanged
       */
      queryClient.setQueryData(
        queryKeys.bookings.infinite(user?.id),
        (old: InfiniteBookingsData) => {
          if (!old?.pages) return old;

          const optimisticBooking = {
            id: generateUUIDSync(),
            ...newBooking,
            bookingNumber: generateUUIDSync(),
            bookingStatus: BOOKING_STATUS.ACTIVE,
            createdAt: new Date().toISOString(),
          };

          return {
            ...old,
            pages: [
              [optimisticBooking, ...(old.pages[0] || [])],
              ...old.pages.slice(1),
            ],
          };
        },
      );

      /**
       * Optimistically deduct wallet balance
       */
      queryClient.setQueryData(
        queryKeys.wallet.detail(user?.id),
        (old: Wallet) => {
          if (!old) return old;
          return {
            ...old,
            balance: old.balance - newBooking.totalAmount,
          };
        },
      );

      /**
       * Return snapshots for rollback
       */
      return { previousBookings, previousWallet };
    },

    /**
     * Rollback optimistic updates on error
     */
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousBookings) {
        queryClient.setQueryData(
          queryKeys.bookings.list(user?.id),
          context.previousBookings,
        );
      }

      if (context?.previousWallet) {
        queryClient.setQueryData(
          queryKeys.wallet.detail(user?.id),
          context.previousWallet,
        );
      }

      // Ensure infinite query is consistent
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.infinite(user?.id),
      });
    },
    onSuccess: data => {
      // Add real booking to cache
      queryClient.setQueryData(queryKeys.bookings.detail(data.id), data);

      // Clear local booking state
      resetBooking();
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.wallet.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.all,
      });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const wallet = useWalletStore(state => state.wallet);

  return useMutation({
    mutationFn: async ({
      bookingId,
      amount,
    }: {
      bookingId: string;
      amount: number;
    }) => {
      await runEffectForQuery(
        Effect.gen(function* () {
          const bookingService = yield* BookingService;
          return yield* bookingService.cancelBooking(bookingId);
        }),
        BookingServiceLayer,
      );

      if (wallet) {
        await walletService.refund(wallet.id, amount, bookingId);
      }
    },
    onMutate: async ({ bookingId, amount }) => {
      // Cancel queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.bookings.lists(),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.wallet.detail(user?.id),
      });

      // Snapshots
      const previousBookings = queryClient.getQueryData(
        queryKeys.bookings.list(user?.id),
      );
      const previousInfiniteBookings = queryClient.getQueryData(
        queryKeys.bookings.infinite(user?.id),
      );
      const previousWallet = queryClient.getQueryData(
        queryKeys.wallet.detail(user?.id),
      );

      // Optimistic updates for list
      queryClient.setQueryData(
        queryKeys.bookings.list(user?.id),
        (old: Booking[]) => {
          if (!old) return old;
          return old.map(booking =>
            booking.id === bookingId
              ? { ...booking, bookingStatus: BOOKING_STATUS.CANCELLED }
              : booking,
          );
        },
      );

      // Optimistic updates for infinite query
      queryClient.setQueryData(
        queryKeys.bookings.infinite(user?.id),
        (old: InfiniteBookingsData) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map(page =>
              page.map(booking =>
                booking.id === bookingId
                  ? { ...booking, bookingStatus: BOOKING_STATUS.CANCELLED }
                  : booking,
              ),
            ),
          };
        },
      );

      // Optimistic wallet update
      queryClient.setQueryData(
        queryKeys.wallet.detail(user?.id),
        (old: Wallet) => {
          if (!old) return old;
          return {
            ...old,
            balance: old.balance + amount,
          };
        },
      );

      return { previousBookings, previousInfiniteBookings, previousWallet };
    },
    onError: (err, variables, context) => {
      // Rollback all changes
      if (context?.previousBookings) {
        queryClient.setQueryData(
          queryKeys.bookings.list(user?.id),
          context.previousBookings,
        );
      }

      if (context?.previousInfiniteBookings) {
        queryClient.setQueryData(
          queryKeys.bookings.infinite(user?.id),
          context.previousInfiniteBookings,
        );
      }

      if (context?.previousWallet) {
        queryClient.setQueryData(
          queryKeys.wallet.detail(user?.id),
          context.previousWallet,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
    },
  });
};

export const useReserveSeats = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const setReservationId = useBookingStore(state => state.setReservationId);

  return useMutation({
    mutationFn: ({
      showtimeId,
      seats,
    }: {
      showtimeId: string;
      seats: string[];
    }) =>
      runEffectForQuery(
        Effect.gen(function* () {
          const bookingService = yield* BookingService;
          return yield* bookingService.reserveSeats(
            showtimeId,
            user!.id,
            seats,
          );
        }),
        BookingServiceLayer,
      ),

    onSuccess: data => {
      // Store reservation ID
      setReservationId(data.id);

      // Auto-release after timeout
      setTimeout(() => {
        setReservationId(null);
      }, API_CONFIG.SEAT_RESERVATION_TIMEOUT);

      // Optimistically reduce available seats
      queryClient.setQueryData(
        queryKeys.showtimes.detail(data.showtimeId),
        (old: Showtime) => ({
          ...old,
          availableSeats: old.availableSeats - data.seatNumbers.length,
        }),
      );
    },
  });
};

export const useReleaseSeats = () => {
  const queryClient = useQueryClient();
  const setReservationId = useBookingStore(state => state.setReservationId);

  return useMutation({
    mutationFn: (reservationId: string) =>
      runEffectForQuery(
        Effect.gen(function* () {
          const bookingService = yield* BookingService;
          return yield* bookingService.releaseSeats(reservationId);
        }),
        BookingServiceLayer,
      ),

    onSuccess: () => {
      setReservationId(null);
      queryClient.invalidateQueries({
        queryKey: queryKeys.showtimes.all,
      });
    },
  });
};
