import { API_CONFIG, PAGINATION, queryKeys } from '@/constants';
import {
  bookingsService,
  CreateBookingData,
  walletService,
} from '@/services/supabase';
import { useAuthStore, useBookingStore, useWalletStore } from '@/stores';
import { BookingStatus } from '@/types';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export const useBookings = (status?: string) => {
  const user = useAuthStore(state => state.user);

  return useQuery({
    queryKey: queryKeys.bookings.list(user?.id, status),
    queryFn: () => bookingsService.getBookings(user!.id, status),
    enabled: !!user,
    staleTime: API_CONFIG.BOOKING_STALE_TIME,
  });
};

export const useBookingsInfinite = (status?: string) => {
  const user = useAuthStore(state => state.user);

  return useInfiniteQuery({
    queryKey: queryKeys.bookings.infinite(user?.id, status),
    queryFn: ({ pageParam = PAGINATION.PAGE_OFFSET }) =>
      bookingsService.getBookingsPaginated(user!.id, status, pageParam, PAGINATION.PAGE_LIMIT),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGINATION.PAGE_LIMIT) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
    enabled: !!user,
    staleTime: API_CONFIG.BOOKING_STALE_TIME,
  });
};

export const useBooking = (bookingId: string) => {
  return useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: () => bookingsService.getBookingById(bookingId),
    enabled: !!bookingId,
    staleTime: API_CONFIG.BOOKING_STALE_TIME,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const wallet = useWalletStore(state => state.wallet);
  const resetBooking = useBookingStore(state => state.reset);

  return useMutation({
    mutationFn: async (data: CreateBookingData) => {
      if (!wallet || wallet.balance < data.totalAmount) {
        throw new Error('Insufficient wallet balance');
      }

      const booking = await bookingsService.createBooking(data);

      await walletService.processPurchase(
        wallet.id,
        data.totalAmount,
        booking.id,
        `Ticket purchase - Booking #${booking.bookingNumber}`,
      );

      return booking;
    },
    onMutate: async newBooking => {
      // Cancel outgoing queries
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

      // Optimistically update bookings list
      queryClient.setQueryData(
        queryKeys.bookings.list(user?.id),
        (old: any) => {
          if (!old) return old;
          const optimisticBooking = {
            id: 'temp-' + Date.now(),
            ...newBooking,
            bookingNumber: 'PENDING',
            bookingStatus: BookingStatus.ACTIVE,
            createdAt: new Date().toISOString(),
          };
          return [optimisticBooking, ...old];
        },
      );

      // Optimistically update wallet
      queryClient.setQueryData(
        queryKeys.wallet.detail(user?.id),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            balance: old.balance - newBooking.totalAmount,
          };
        },
      );

      return { previousBookings, previousWallet };
    },
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
    },
    onSuccess: data => {
      // Add real booking to cache
      queryClient.setQueryData(queryKeys.bookings.detail(data.id), data);

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
      await bookingsService.cancelBooking(bookingId);

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
      const previousWallet = queryClient.getQueryData(
        queryKeys.wallet.detail(user?.id),
      );

      // Optimistic updates
      queryClient.setQueryData(
        queryKeys.bookings.list(user?.id),
        (old: any) => {
          if (!old) return old;
          return old.map((booking: any) =>
            booking.id === bookingId
              ? { ...booking, bookingStatus: BookingStatus.CANCELLED }
              : booking,
          );
        },
      );

      queryClient.setQueryData(
        queryKeys.wallet.detail(user?.id),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            balance: old.balance + amount,
          };
        },
      );

      return { previousBookings, previousWallet };
    },
    onError: (err, variables, context) => {
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
    }) => bookingsService.reserveSeats(showtimeId, user!.id, seats),
    onSuccess: data => {
      setReservationId(data.id);

      // Auto-release after 10 minutes
      setTimeout(() => {
        setReservationId(null);
      }, API_CONFIG.SEAT_RESERVATION_TIMEOUT);

      // Update showtime available seats optimistically
      queryClient.setQueryData(
        queryKeys.showtimes.detail(data.showtimeId),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            availableSeats: old.availableSeats - data.seatNumbers.length,
          };
        },
      );
    },
  });
};

export const useReleaseSeats = () => {
  const queryClient = useQueryClient();
  const setReservationId = useBookingStore(state => state.setReservationId);

  return useMutation({
    mutationFn: (reservationId: string) =>
      bookingsService.releaseSeats(reservationId),
    onSuccess: () => {
      setReservationId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.showtimes.all });
    },
  });
};
