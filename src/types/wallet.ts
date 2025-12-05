export enum WalletTransactionType {
  TOP_UP = 'top_up',
  PURCHASE = 'purchase',
  REFUND = 'refund',
}

export enum WalletTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  cardNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  transactionType: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  status: WalletTransactionStatus;
  createdAt: string;
}
