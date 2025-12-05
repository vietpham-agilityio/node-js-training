import { API_CONFIG, PAGINATION, queryKeys } from '@/constants';
import { ticketsService } from '@/services/supabase';
import { useAuthStore } from '@/stores';
import { Ticket, TicketStatus } from '@/types';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export const useTickets = () => {
  const user = useAuthStore(state => state.user);

  return useQuery({
    queryKey: queryKeys.tickets.list(user?.id),
    queryFn: () => ticketsService.getTickets(user!.id),
    enabled: !!user,
    staleTime: API_CONFIG.BOOKING_STALE_TIME,
  });
};

export const useTicketsInfinite = () => {
  const user = useAuthStore(state => state.user);

  return useInfiniteQuery({
    queryKey: queryKeys.tickets.infinite(user?.id),
    queryFn: ({ pageParam = PAGINATION.PAGE_OFFSET }) =>
      ticketsService.getTicketsPaginated(
        user!.id,
        pageParam,
        PAGINATION.PAGE_LIMIT_MAX,
      ),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGINATION.PAGE_LIMIT_MAX) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
    enabled: !!user,
    staleTime: API_CONFIG.BOOKING_STALE_TIME,
  });
};

export const useTicket = (ticketId: string) => {
  return useQuery({
    queryKey: queryKeys.tickets.detail(ticketId),
    queryFn: () => ticketsService.getTicketById(ticketId),
    enabled: !!ticketId,
    staleTime: API_CONFIG.BOOKING_STALE_TIME,
  });
};

export const useValidateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qrData: string) => ticketsService.validateTicket(qrData),
    onSuccess: result => {
      if (result.valid && result.ticket) {
        // Update ticket status in cache
        queryClient.setQueryData(
          queryKeys.tickets.detail(result.ticket.id),
          (old: Ticket) => ({
            ...old,
            status: TicketStatus.USED,
            scannedAt: new Date().toISOString(),
          }),
        );

        // Invalidate tickets list
        queryClient.invalidateQueries({
          queryKey: queryKeys.tickets.lists(),
        });
      }
    },
  });
};
