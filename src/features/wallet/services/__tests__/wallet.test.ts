import { Wallet } from '@/features/wallet/schemas/wallet';
import { supabase } from '@/services/supabase/client';
import { keysToCamel } from '@/utils/convert';
import { WalletService, walletService } from '../wallet';
import {
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from '@/constants/status';

// --- Mock Query Builder Factory ---
const createMockQueryBuilder = () => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn(),
  then: jest.fn(),
});

const mockQueryBuilder = createMockQueryBuilder();

jest.mock('@/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => mockQueryBuilder),
  },
}));

jest.unmock('@/utils/convert');

describe('WalletService', () => {
  let service: WalletService;
  const from = supabase.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = WalletService.getInstance();

    // Reset mockQueryBuilder methods
    Object.values(mockQueryBuilder).forEach(mockFn => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockClear();
        if (
          mockFn !== mockQueryBuilder.single &&
          mockFn !== mockQueryBuilder.then
        ) {
          mockFn.mockReturnThis?.();
        }
      }
    });

    // Default implementations
    (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
      resolve({ data: [], error: null }),
    );
    (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });
  });

  it('should be a singleton', () => {
    const instance1 = WalletService.getInstance();
    const instance2 = WalletService.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(walletService);
  });

  describe('createWallet', () => {
    it('should create a wallet for a user', async () => {
      const mockWallet = {
        id: 'wallet1',
        user_id: 'user1',
        balance: 0,
        currency: 'IDR',
        is_active: true,
      };

      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockWallet,
        error: null,
      });

      const wallet = await service.createWallet('user1');

      expect(from).toHaveBeenCalledWith('wallets');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        user_id: 'user1',
        balance: 0,
        currency: 'IDR',
        card_number: undefined,
        is_active: true,
      });
      expect(wallet).toEqual(keysToCamel(mockWallet));
    });

    it('should create a wallet with card number', async () => {
      const mockWallet = {
        id: 'wallet1',
        user_id: 'user1',
        balance: 0,
        card_number: '1234567890123456',
      };

      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockWallet,
        error: null,
      });

      await service.createWallet('user1', '1234567890123456');

      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          card_number: '1234567890123456',
        }),
      );
    });

    it('should throw an error if creation fails', async () => {
      const error = new Error('Creation failed');

      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.createWallet('user1')).rejects.toThrow(error);
    });
  });

  describe('getWallet', () => {
    it('should fetch a wallet for a user', async () => {
      const mockWallet = {
        id: 'wallet1',
        user_id: 'user1',
        balance: 10000,
        currency: 'IDR',
      };

      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockWallet,
        error: null,
      });

      const wallet = await service.getWallet('user1');

      expect(from).toHaveBeenCalledWith('wallets');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user1');
      expect(mockQueryBuilder.single).toHaveBeenCalled();
      expect(wallet).toEqual(keysToCamel(mockWallet));
    });

    it('should throw an error if wallet not found', async () => {
      const error = new Error('Wallet not found');

      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.getWallet('user1')).rejects.toThrow(error);
    });
  });

  describe('getTransactions', () => {
    it('should fetch transactions for a user', async () => {
      const mockWallet = {
        id: 'wallet1',
        user_id: 'user1',
        balance: 10000,
      } as unknown as Wallet;
      const mockTransactions = [
        {
          id: 'tx1',
          wallet_id: 'wallet1',
          transaction_type: WALLET_TRANSACTION_TYPE.TOP_UP,
          amount: 50000,
          reference_id: null,
        },
        {
          id: 'tx2',
          wallet_id: 'wallet1',
          transaction_type: WALLET_TRANSACTION_TYPE.PAYMENT,
          amount: -20000,
          reference_id: 'booking1',
        },
      ];

      const mockBooking = {
        id: 'booking1',
        booking_number: 'BK001',
      };

      // Mock getWallet
      jest.spyOn(service, 'getWallet').mockResolvedValue(mockWallet);

      // Mock transactions query
      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: mockTransactions, error: null }),
      );

      // Mock booking query for transaction with reference_id
      (mockQueryBuilder.single as jest.Mock).mockResolvedValueOnce({
        data: mockBooking,
        error: null,
      });

      const transactions = await service.getTransactions('user1', 10);

      expect(service.getWallet).toHaveBeenCalledWith('user1');
      expect(from).toHaveBeenCalledWith('wallet_transactions');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('wallet_id', 'wallet1');
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
      expect(transactions).toHaveLength(2);
    });

    it('should handle transactions without booking reference', async () => {
      const mockWallet = {
        id: 'wallet1',
        user_id: 'user1',
        balance: 10000,
      } as unknown as Wallet;
      const mockTransactions = [
        {
          id: 'tx1',
          wallet_id: 'wallet1',
          reference_id: null,
        },
      ];

      jest.spyOn(service, 'getWallet').mockResolvedValue(mockWallet);
      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: mockTransactions, error: null }),
      );

      const transactions = await service.getTransactions('user1');

      expect(transactions[0]).toHaveProperty('booking', null);
    });

    it('should handle booking fetch errors gracefully', async () => {
      const mockWallet = {
        id: 'wallet1',
        user_id: 'user1',
        balance: 10000,
      } as unknown as Wallet;
      const mockTransactions = [
        {
          id: 'tx1',
          reference_id: 'booking1',
        },
      ];

      jest.spyOn(service, 'getWallet').mockResolvedValue(mockWallet);
      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: mockTransactions, error: null }),
      );
      (mockQueryBuilder.single as jest.Mock).mockRejectedValueOnce(
        new Error('Booking not found'),
      );

      const transactions = await service.getTransactions('user1');

      // Should return transaction with booking: null
      expect(transactions[0]).toHaveProperty('booking', null);
    });
  });

  describe('topUp', () => {
    it('should add funds to wallet', async () => {
      const mockWallet = { balance: 10000 };
      const mockTransaction = {
        id: 'tx1',
        wallet_id: 'wallet1',
        transaction_type: WALLET_TRANSACTION_TYPE.TOP_UP,
        amount: 50000,
        balance_before: 10000,
        balance_after: 60000,
      };

      (mockQueryBuilder.single as jest.Mock)
        .mockResolvedValueOnce({ data: mockWallet, error: null })
        .mockResolvedValueOnce({ data: mockTransaction, error: null });

      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: {}, error: null }),
      );

      const transaction = await service.topUp('wallet1', 50000);

      expect(from).toHaveBeenCalledWith('wallets');
      expect(from).toHaveBeenCalledWith('wallet_transactions');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          wallet_id: 'wallet1',
          transaction_type: WALLET_TRANSACTION_TYPE.TOP_UP,
          amount: 50000,
          balance_before: 10000,
          balance_after: 60000,
          status: WALLET_TRANSACTION_STATUS.COMPLETED,
        }),
      );
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: 60000,
        }),
      );
      expect(transaction).toEqual(keysToCamel(mockTransaction));
    });

    it('should handle zero initial balance', async () => {
      const mockWallet = { balance: 0 };
      const mockTransaction = {
        id: 'tx1',
        amount: 10000,
        balance_before: 0,
        balance_after: 10000,
      };

      (mockQueryBuilder.single as jest.Mock)
        .mockResolvedValueOnce({ data: mockWallet, error: null })
        .mockResolvedValueOnce({ data: mockTransaction, error: null });

      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: {}, error: null }),
      );

      await service.topUp('wallet1', 10000);

      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          balance_before: 0,
          balance_after: 10000,
        }),
      );
    });

    it('should throw an error if wallet not found', async () => {
      const error = new Error('Wallet not found');

      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.topUp('wallet1', 50000)).rejects.toThrow(error);
    });
  });

  describe('processPurchase', () => {
    it('should deduct funds for a purchase', async () => {
      const mockWallet = { balance: 50000 };
      const mockTransaction = {
        id: 'tx1',
        wallet_id: 'wallet1',
        transaction_type: WALLET_TRANSACTION_TYPE.PAYMENT,
        amount: -20000,
        balance_before: 50000,
        balance_after: 30000,
      };

      (mockQueryBuilder.single as jest.Mock)
        .mockResolvedValueOnce({ data: mockWallet, error: null })
        .mockResolvedValueOnce({ data: mockTransaction, error: null });

      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: {}, error: null }),
      );

      const transaction = await service.processPurchase(
        'wallet1',
        20000,
        'booking1',
        'Movie ticket purchase',
      );

      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          wallet_id: 'wallet1',
          transaction_type: WALLET_TRANSACTION_TYPE.PAYMENT,
          amount: -20000,
          balance_before: 50000,
          balance_after: 30000,
          description: 'Movie ticket purchase',
          reference_id: 'booking1',
          status: WALLET_TRANSACTION_STATUS.COMPLETED,
        }),
      );
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: 30000,
        }),
      );
      expect(transaction).toEqual(keysToCamel(mockTransaction));
    });

    it('should throw error if insufficient balance', async () => {
      const mockWallet = { balance: 5000 };

      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockWallet,
        error: null,
      });

      await expect(
        service.processPurchase('wallet1', 10000, 'booking1', 'Purchase'),
      ).rejects.toThrow('Insufficient balance');
    });

    it('should allow purchase with exact balance', async () => {
      const mockWallet = { balance: 20000 };
      const mockTransaction = { id: 'tx1', balance_after: 0 };

      (mockQueryBuilder.single as jest.Mock)
        .mockResolvedValueOnce({ data: mockWallet, error: null })
        .mockResolvedValueOnce({ data: mockTransaction, error: null });

      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: {}, error: null }),
      );

      await service.processPurchase('wallet1', 20000, 'booking1', 'Purchase');

      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          balance_after: 0,
        }),
      );
    });
  });

  describe('refund', () => {
    it('should add refund to wallet', async () => {
      const mockWallet = { balance: 30000 };
      const mockTransaction = {
        id: 'tx1',
        wallet_id: 'wallet1',
        transaction_type: WALLET_TRANSACTION_TYPE.REFUND,
        amount: 20000,
        balance_before: 30000,
        balance_after: 50000,
      };

      (mockQueryBuilder.single as jest.Mock)
        .mockResolvedValueOnce({ data: mockWallet, error: null })
        .mockResolvedValueOnce({ data: mockTransaction, error: null });

      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: {}, error: null }),
      );

      const transaction = await service.refund('wallet1', 20000, 'booking1');

      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          wallet_id: 'wallet1',
          transaction_type: WALLET_TRANSACTION_TYPE.REFUND,
          amount: 20000,
          balance_before: 30000,
          balance_after: 50000,
          description: 'Booking refund',
          reference_id: 'booking1',
          status: WALLET_TRANSACTION_STATUS.COMPLETED,
        }),
      );
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: 50000,
        }),
      );
      expect(transaction).toEqual(keysToCamel(mockTransaction));
    });
  });

  describe('getTransactionsPaginated', () => {
    it('should fetch paginated transactions', async () => {
      const mockWallet = {
        id: 'wallet1',
        user_id: 'user1',
        balance: 10000,
      } as unknown as Wallet;
      const mockTransactions = [
        { id: 'tx1', reference_id: null },
        { id: 'tx2', reference_id: null },
      ];

      jest.spyOn(service, 'getWallet').mockResolvedValue(mockWallet);
      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: mockTransactions, error: null }),
      );

      const transactions = await service.getTransactionsPaginated(
        'user1',
        0,
        10,
      );

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('wallet_id', 'wallet1');
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9);
      expect(transactions).toHaveLength(2);
    });

    it('should calculate correct range for different pages', async () => {
      const mockWallet = {
        id: 'wallet1',
        user_id: 'user1',
        balance: 10000,
      } as unknown as Wallet;

      jest.spyOn(service, 'getWallet').mockResolvedValue(mockWallet);
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: [], error: null }),
      );

      // Page 0, limit 10
      await service.getTransactionsPaginated('user1', 0, 10);
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9);

      // Page 1, limit 10
      await service.getTransactionsPaginated('user1', 1, 10);
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(10, 19);

      // Page 2, limit 20
      await service.getTransactionsPaginated('user1', 2, 20);
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(40, 59);
    });

    it('should enrich transactions with booking data', async () => {
      const mockWallet = {
        id: 'wallet1',
        user_id: 'user1',
        balance: 10000,
      } as unknown as Wallet;
      const mockTransactions = [{ id: 'tx1', reference_id: 'booking1' }];
      const mockBooking = { id: 'booking1', booking_number: 'BK001' };

      jest.spyOn(service, 'getWallet').mockResolvedValue(mockWallet);
      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: mockTransactions, error: null }),
      );
      (mockQueryBuilder.single as jest.Mock).mockResolvedValueOnce({
        data: mockBooking,
        error: null,
      });

      const transactions = await service.getTransactionsPaginated(
        'user1',
        0,
        10,
      );

      expect(transactions[0]).toHaveProperty('booking');
      expect(transactions[0]?.booking).toBeTruthy();
    });
  });
});
