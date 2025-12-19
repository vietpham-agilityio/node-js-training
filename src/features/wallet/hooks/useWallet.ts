import { API_CONFIG, PAGINATION, queryKeys } from '@/constants';

// Services
import { walletService } from '@/features/wallet/services/wallet';

// Stores
import { useAuthStore } from '@/features/auth/store/auth';
import { useWalletStore } from '@/features/wallet/store/wallet';

// React Query
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';

export const useWallet = () => {
  const user = useAuthStore(state => state.user);
  const setWallet = useWalletStore(state => state.setWallet);

  const query = useQuery({
    queryKey: queryKeys.wallet.detail(user?.id),
    queryFn: () => walletService.getWallet(user!.id),
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds for fresh balance
    gcTime: API_CONFIG.QUERY_STALE_TIME,
  });

  useEffect(() => {
    if (query.data) {
      setWallet(query.data);
    }
  }, [query.data, setWallet]);

  return query;
};

export const useTransactions = (limit = PAGINATION.PAGE_LIMIT_MAX) => {
  const user = useAuthStore(state => state.user);

  return useQuery({
    queryKey: queryKeys.wallet.transactions(user?.id),
    queryFn: () => walletService.getTransactions(user!.id, limit),
    enabled: !!user,
    staleTime: API_CONFIG.BOOKING_STALE_TIME,
  });
};

export const useTransactionsInfinite = () => {
  const user = useAuthStore(state => state.user);

  return useInfiniteQuery({
    queryKey: queryKeys.wallet.transactionsInfinite(user?.id),
    queryFn: ({ pageParam = PAGINATION.PAGE_OFFSET }) =>
      walletService.getTransactionsPaginated(
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

export const useTopUp = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const wallet = useWalletStore(state => state.wallet);

  return useMutation({
    mutationFn: (amount: number) => {
      if (!wallet) throw new Error('Wallet not found');
      return walletService.topUp(wallet.id, amount);
    },
    onMutate: async amount => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.wallet.detail(user?.id),
      });

      // Snapshot previous value
      const previousWallet = queryClient.getQueryData(
        queryKeys.wallet.detail(user?.id),
      );

      // Optimistically update wallet balance
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

      return { previousWallet };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousWallet) {
        queryClient.setQueryData(
          queryKeys.wallet.detail(user?.id),
          context.previousWallet,
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.wallet.detail(user?.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.wallet.transactions(user?.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.wallet.transactionsInfinite(user?.id),
      });
    },
  });
};
