import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

// Services
import { ticketExpirationService } from '../services/ticketExpiration';

// Stores
import { useAuthStore } from '@/features/auth/store/auth';

// Constants
import { queryKeys } from '@/constants';
import { BOOKING_STATUS } from '@/constants/status';

export const useTicketExpiration = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  /**
   * Check and expire tickets
   */
  const checkExpiredTickets = useCallback(async () => {
    if (!user?.id) return 0;

    try {
      const expiredCount =
        await ticketExpirationService.checkAndExpireTickets();

      if (expiredCount > 0) {
        // Invalidate queries to refresh UI
        queryClient.invalidateQueries({
          queryKey: queryKeys.tickets.all,
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.all,
        });
      }

      return expiredCount;
    } catch {
      return 0;
    }
  }, [user?.id, queryClient]);

  /**
   * Check specific ticket status
   */
  const checkTicketStatus = useCallback(
    async (ticketId: string) => {
      try {
        const status =
          await ticketExpirationService.checkTicketStatus(ticketId);

        // Invalidate queries if status changed
        if (status === BOOKING_STATUS.EXPIRED) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.tickets.detail(ticketId),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.tickets.all,
          });
        }

        return status;
      } catch {
        return BOOKING_STATUS.EXPIRED;
      }
    },
    [queryClient],
  );

  /**
   * Auto-check on mount and periodically
   */
  useEffect(() => {
    if (!user?.id) return;

    // Initial check
    checkExpiredTickets();

    // Start periodic check (every 5 minutes)
    const interval = ticketExpirationService.startPeriodicCheck(5);

    // Cleanup on unmount
    return () => {
      ticketExpirationService.stopPeriodicCheck(interval);
    };
  }, [user?.id, checkExpiredTickets]);

  return {
    checkExpiredTickets,
    checkTicketStatus,
  };
};
