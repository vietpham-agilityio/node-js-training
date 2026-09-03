import { act } from '@testing-library/react-native';

import { useWalletStore } from '../wallet';

// Types
import { Wallet } from '@/features/wallet/schemas/wallet';

const mockWallet: Wallet = {
  id: 'wallet-123',
  userId: 'user-456',
  balance: 1000,
  currency: 'USD',
  cardNumber: '****1234',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('useWalletStore', () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    act(() => {
      useWalletStore.setState({
        wallet: null,
        isLoading: true,
      });
    });
  });

  describe('initial state', () => {
    it('should have null wallet initially', () => {
      const { wallet } = useWalletStore.getState();

      expect(wallet).toBeNull();
    });

    it('should have isLoading as true initially', () => {
      const { isLoading } = useWalletStore.getState();

      expect(isLoading).toBe(true);
    });
  });

  describe('setWallet', () => {
    it('should set the wallet and set isLoading to false', () => {
      const { setWallet } = useWalletStore.getState();

      act(() => {
        setWallet(mockWallet);
      });

      const { wallet, isLoading } = useWalletStore.getState();

      expect(wallet).toEqual(mockWallet);
      expect(isLoading).toBe(false);
    });

    it('should set wallet to null and isLoading to false', () => {
      const { setWallet } = useWalletStore.getState();

      // First set a wallet
      act(() => {
        setWallet(mockWallet);
      });

      // Then set it to null
      act(() => {
        setWallet(null);
      });

      const { wallet, isLoading } = useWalletStore.getState();

      expect(wallet).toBeNull();
      expect(isLoading).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should set isLoading to true', () => {
      const { setLoading } = useWalletStore.getState();

      act(() => {
        setLoading(true);
      });

      const { isLoading } = useWalletStore.getState();

      expect(isLoading).toBe(true);
    });

    it('should set isLoading to false', () => {
      const { setLoading } = useWalletStore.getState();

      act(() => {
        setLoading(false);
      });

      const { isLoading } = useWalletStore.getState();

      expect(isLoading).toBe(false);
    });
  });

  describe('updateBalance', () => {
    it('should update the balance when wallet exists', () => {
      const { setWallet, updateBalance } = useWalletStore.getState();
      const newBalance = 2000;

      act(() => {
        setWallet(mockWallet);
      });

      act(() => {
        updateBalance(newBalance);
      });

      const { wallet } = useWalletStore.getState();

      expect(wallet?.balance).toBe(newBalance);
      expect(wallet?.id).toBe(mockWallet.id);
      expect(wallet?.userId).toBe(mockWallet.userId);
    });

    it('should not update balance when wallet is null', () => {
      const { updateBalance } = useWalletStore.getState();

      act(() => {
        updateBalance(2000);
      });

      const { wallet } = useWalletStore.getState();

      expect(wallet).toBeNull();
    });

    it('should preserve other wallet properties when updating balance', () => {
      const { setWallet, updateBalance } = useWalletStore.getState();
      const newBalance = 5000;

      act(() => {
        setWallet(mockWallet);
      });

      act(() => {
        updateBalance(newBalance);
      });

      const { wallet } = useWalletStore.getState();

      expect(wallet).toEqual({
        ...mockWallet,
        balance: newBalance,
      });
    });
  });

  describe('reset', () => {
    it('should reset wallet to null and isLoading to false', () => {
      const { setWallet, reset } = useWalletStore.getState();

      // First set a wallet
      act(() => {
        setWallet(mockWallet);
      });

      // Then reset
      act(() => {
        reset();
      });

      const { wallet, isLoading } = useWalletStore.getState();

      expect(wallet).toBeNull();
      expect(isLoading).toBe(false);
    });

    it('should reset from loading state', () => {
      const { setLoading, reset } = useWalletStore.getState();

      act(() => {
        setLoading(true);
      });

      act(() => {
        reset();
      });

      const { wallet, isLoading } = useWalletStore.getState();

      expect(wallet).toBeNull();
      expect(isLoading).toBe(false);
    });
  });
});
