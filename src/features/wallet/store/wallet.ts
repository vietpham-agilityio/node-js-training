import { create } from 'zustand';

// Types
import { Wallet } from '@/features/wallet/schemas/wallet';

interface WalletState {
  wallet: Wallet | null;
  isLoading: boolean;

  setWallet: (wallet: Wallet | null) => void;
  setLoading: (loading: boolean) => void;
  updateBalance: (newBalance: number) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>(set => ({
  wallet: null,
  isLoading: true,

  setWallet: wallet => set({ wallet, isLoading: false }),

  setLoading: isLoading => set({ isLoading }),

  updateBalance: newBalance =>
    set(state => ({
      wallet: state.wallet ? { ...state.wallet, balance: newBalance } : null,
    })),

  reset: () => set({ wallet: null, isLoading: false }),
}));
