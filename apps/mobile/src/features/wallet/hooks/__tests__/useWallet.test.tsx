import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

// Constants
import { queryKeys } from '@/constants';
import {
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from '@/constants/status';

// Hooks
import {
  useTopUp,
  useTransactions,
  useTransactionsInfinite,
  useWallet,
} from '../useWallet';

// Types
import { Wallet, WalletTransaction } from '@/features/wallet/schemas/wallet';

// Mock dependencies
const mockGetWallet = jest.fn();
const mockGetTransactions = jest.fn();
const mockGetTransactionsPaginated = jest.fn();
const mockTopUp = jest.fn();

jest.mock('@/features/wallet/services/wallet', () => ({
  walletService: {
    getWallet: (userId: string) => mockGetWallet(userId),
    getTransactions: (userId: string, limit: number) =>
      mockGetTransactions(userId, limit),
    getTransactionsPaginated: (userId: string, page: number, limit: number) =>
      mockGetTransactionsPaginated(userId, page, limit),
    topUp: (walletId: string, amount: number) => mockTopUp(walletId, amount),
  },
}));

const mockUser = { id: 'user1', email: 'test@example.com' };
const mockWallet: Wallet = {
  id: 'wallet1',
  userId: 'user1',
  balance: 100000,
  currency: 'IDR',
  cardNumber: '6032 1506 4207 2004',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockSetWallet = jest.fn();

// Mock stores
const mockUseAuthStore = jest.fn();
const mockUseWalletStore = jest.fn();

jest.mock('@/features/auth/store/auth', () => ({
  useAuthStore: (selector: any) => mockUseAuthStore(selector),
}));

jest.mock('@/features/wallet/store/wallet', () => ({
  useWalletStore: (selector: any) => mockUseWalletStore(selector),
}));

// Helper to setup store mocks
const setupStoreMocks = (
  user: any = mockUser,
  wallet: Wallet | null = null,
) => {
  mockUseAuthStore.mockImplementation((selector: any) => {
    if (selector) {
      return selector({ user });
    }
    return { user };
  });

  mockUseWalletStore.mockImplementation((selector: any) => {
    if (selector) {
      return selector({ wallet, setWallet: mockSetWallet });
    }
    return { wallet, setWallet: mockSetWallet };
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

describe('useWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStoreMocks();
  });

  it('should fetch wallet when user exists', async () => {
    mockGetWallet.mockResolvedValue(mockWallet);

    const { result } = renderHook(() => useWallet(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetWallet).toHaveBeenCalledWith('user1');
    expect(result.current.data).toEqual(mockWallet);
  });

  it('should be disabled when user does not exist', () => {
    setupStoreMocks(null);

    const { result } = renderHook(() => useWallet(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(mockGetWallet).not.toHaveBeenCalled();
  });

  it('should update wallet store when data is fetched', async () => {
    mockGetWallet.mockResolvedValue(mockWallet);

    const { result } = renderHook(() => useWallet(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSetWallet).toHaveBeenCalledWith(mockWallet);
  });

  it('should handle error when fetch fails', async () => {
    const mockError = new Error('Failed to fetch wallet');
    mockGetWallet.mockRejectedValue(mockError);

    const { result } = renderHook(() => useWallet(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('should use correct query key', async () => {
    mockGetWallet.mockResolvedValue(mockWallet);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useWallet(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(
        queryClient.getQueryState(queryKeys.wallet.detail('user1')),
      ).toBeTruthy();
    });
  });
});

describe('useTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStoreMocks();
  });

  it('should fetch transactions when user exists', async () => {
    const mockTransactions: WalletTransaction[] = [
      {
        id: 'tx1',
        walletId: 'wallet1',
        transactionType: WALLET_TRANSACTION_TYPE.PAYMENT,
        amount: 50000,
        balanceBefore: 100000,
        balanceAfter: 50000,
        description: 'Movie ticket purchase',
        status: WALLET_TRANSACTION_STATUS.COMPLETED,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    mockGetTransactions.mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetTransactions).toHaveBeenCalledWith('user1', 20);
    expect(result.current.data).toEqual(mockTransactions);
  });

  it('should use custom limit when provided', async () => {
    const mockTransactions: WalletTransaction[] = [];
    mockGetTransactions.mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useTransactions(50), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetTransactions).toHaveBeenCalledWith('user1', 50);
  });

  it('should be disabled when user does not exist', () => {
    setupStoreMocks(null);

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(mockGetTransactions).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const mockError = new Error('Failed to fetch transactions');
    mockGetTransactions.mockRejectedValue(mockError);

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});

describe('useTransactionsInfinite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStoreMocks();
  });

  it('should fetch first page of transactions', async () => {
    const page1 = Array.from({ length: 20 }, (_, i) => ({
      id: `tx${i + 1}`,
      walletId: 'wallet1',
      transactionType: 'payment' as const,
      amount: 10000,
      balanceBefore: 100000,
      balanceAfter: 90000,
      description: `Transaction ${i + 1}`,
      status: 'completed' as const,
      createdAt: '2024-01-01T00:00:00Z',
    }));

    mockGetTransactionsPaginated.mockResolvedValue(page1);

    const { result } = renderHook(() => useTransactionsInfinite(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetTransactionsPaginated).toHaveBeenCalledWith('user1', 0, 20);
    expect(result.current.data?.pages[0]).toEqual(page1);
  });

  it('should fetch next page when fetchNextPage is called', async () => {
    const page1 = Array.from({ length: 20 }, (_, i) => ({
      id: `tx${i + 1}`,
      walletId: 'wallet1',
      transactionType: 'payment' as const,
      amount: 10000,
      balanceBefore: 100000,
      balanceAfter: 90000,
      description: `Transaction ${i + 1}`,
      status: 'completed' as const,
      createdAt: '2024-01-01T00:00:00Z',
    }));

    const page2 = [
      {
        id: 'tx21',
        walletId: 'wallet1',
        transactionType: 'payment' as const,
        amount: 10000,
        balanceBefore: 90000,
        balanceAfter: 80000,
        description: 'Transaction 21',
        status: 'completed' as const,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    mockGetTransactionsPaginated
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    const { result } = renderHook(() => useTransactionsInfinite(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0]).toEqual(page1);
    expect(result.current.hasNextPage).toBe(true);

    act(() => {
      result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.data?.pages.length).toBe(2);
    });

    expect(mockGetTransactionsPaginated).toHaveBeenCalledTimes(2);
    expect(mockGetTransactionsPaginated).toHaveBeenLastCalledWith(
      'user1',
      1,
      20,
    );
    expect(result.current.data?.pages[1]).toEqual(page2);
  });

  it('should return undefined for next page when last page has less than PAGE_LIMIT_MAX items', async () => {
    const page1 = Array.from({ length: 10 }, (_, i) => ({
      id: `tx${i + 1}`,
      walletId: 'wallet1',
      transactionType: 'payment' as const,
      amount: 10000,
      balanceBefore: 100000,
      balanceAfter: 90000,
      description: `Transaction ${i + 1}`,
      status: 'completed' as const,
      createdAt: '2024-01-01T00:00:00Z',
    }));

    mockGetTransactionsPaginated.mockResolvedValue(page1);

    const { result } = renderHook(() => useTransactionsInfinite(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.hasNextPage).toBe(false);
  });

  it('should return next page number when last page has PAGE_LIMIT_MAX items', async () => {
    const page1 = Array.from({ length: 20 }, (_, i) => ({
      id: `tx${i + 1}`,
      walletId: 'wallet1',
      transactionType: 'payment' as const,
      amount: 10000,
      balanceBefore: 100000,
      balanceAfter: 90000,
      description: `Transaction ${i + 1}`,
      status: 'completed' as const,
      createdAt: '2024-01-01T00:00:00Z',
    }));

    mockGetTransactionsPaginated.mockResolvedValue(page1);

    const { result } = renderHook(() => useTransactionsInfinite(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.data?.pages[0]?.length).toBe(20);
  });

  it('should be disabled when user does not exist', () => {
    setupStoreMocks(null);

    const { result } = renderHook(() => useTransactionsInfinite(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(mockGetTransactionsPaginated).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const mockError = new Error('Failed to fetch transactions');
    mockGetTransactionsPaginated.mockRejectedValue(mockError);

    const { result } = renderHook(() => useTransactionsInfinite(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});

describe('useTopUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStoreMocks(mockUser, mockWallet);
  });

  it('should top up wallet successfully', async () => {
    const updatedWallet = { ...mockWallet, balance: 150000 };
    mockTopUp.mockResolvedValue(updatedWallet);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    queryClient.setQueryData(queryKeys.wallet.detail('user1'), mockWallet);

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useTopUp(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.mutate(50000);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockTopUp).toHaveBeenCalledWith('wallet1', 50000);
    expect(result.current.data).toEqual(updatedWallet);
  });

  it('should throw error when wallet is not found', async () => {
    setupStoreMocks(mockUser, null);

    const { result } = renderHook(() => useTopUp(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(50000);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(
      expect.objectContaining({ message: 'Wallet not found' }),
    );
    expect(mockTopUp).not.toHaveBeenCalled();
  });

  it('should handle wallet being null in optimistic update', async () => {
    const updatedWallet = { ...mockWallet, balance: 150000 };
    mockTopUp.mockResolvedValue(updatedWallet);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    // Set query data to null
    queryClient.setQueryData(queryKeys.wallet.detail('user1'), null);

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useTopUp(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.mutate(50000);
    });

    // Should not throw error, just return old value
    const walletData = queryClient.getQueryData(
      queryKeys.wallet.detail('user1'),
    );
    expect(walletData).toBeNull();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should invalidate queries on settled', async () => {
    const updatedWallet = { ...mockWallet, balance: 150000 };
    mockTopUp.mockResolvedValue(updatedWallet);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    queryClient.setQueryData(queryKeys.wallet.detail('user1'), mockWallet);

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useTopUp(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.mutate(50000);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should invalidate wallet detail and transactions queries
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.wallet.detail('user1'),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.wallet.transactions('user1'),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.wallet.transactionsInfinite('user1'),
    });
  });
});
