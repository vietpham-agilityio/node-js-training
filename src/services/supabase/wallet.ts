import { PAGINATION } from '@/constants';
import {
  Wallet,
  WalletTransaction,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/types';
import { keysToCamel } from '@/utils';
import { supabase } from './client';

export class WalletService {
  private static instance: WalletService;

  private constructor() {}

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async createWallet(userId: string, cardNumber?: string): Promise<Wallet> {
    const { data, error } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        balance: 0,
        currency: 'IDR',
        card_number: cardNumber,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return keysToCamel(data) as Wallet;
  }

  async getWallet(userId: string): Promise<Wallet> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return keysToCamel(data) as Wallet;
  }

  async getTransactions(
    userId: string,
    limit = PAGINATION.PAGE_LIMIT_MAX,
  ): Promise<WalletService[]> {
    const wallet = await this.getWallet(userId);
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return keysToCamel(data) as WalletService[];
  }

  async topUp(walletId: string, amount: number): Promise<WalletTransaction> {
    // Get current wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('id', walletId)
      .single();

    if (walletError) throw walletError;

    const balanceBefore = wallet.balance || 0;
    const balanceAfter = balanceBefore + amount;

    // Create transaction
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: walletId,
        transaction_type: WalletTransactionType.TOP_UP,
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: 'Wallet top-up',
        status: WalletTransactionStatus.COMPLETED,
      })
      .select()
      .single();

    if (error) throw error;

    // Update wallet balance
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ balance: balanceAfter })
      .eq('id', walletId);

    if (updateError) throw updateError;

    return keysToCamel(data) as WalletTransaction;
  }

  async processPurchase(
    walletId: string,
    amount: number,
    bookingId: string,
    description: string,
  ): Promise<WalletTransaction> {
    // Get current wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('id', walletId)
      .single();

    if (walletError) throw walletError;

    const balanceBefore = wallet.balance || 0;

    // Check if sufficient balance
    if (balanceBefore < amount) {
      throw new Error('Insufficient balance');
    }

    const balanceAfter = balanceBefore - amount;

    // Create transaction
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: walletId,
        transaction_type: WalletTransactionType.PURCHASE,
        amount: -amount, // Negative for deduction
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description,
        reference_id: bookingId,
        status: WalletTransactionStatus.COMPLETED,
      })
      .select()
      .single();

    if (error) throw error;

    // Update wallet balance
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ balance: balanceAfter })
      .eq('id', walletId);

    if (updateError) throw updateError;

    return keysToCamel(data) as WalletTransaction;
  }

  async refund(
    walletId: string,
    amount: number,
    bookingId: string,
  ): Promise<WalletTransaction> {
    // Get current wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('id', walletId)
      .single();

    if (walletError) throw walletError;

    const balanceBefore = wallet.balance || 0;
    const balanceAfter = balanceBefore + amount;

    // Create transaction
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: walletId,
        transaction_type: WalletTransactionType.REFUND,
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: 'Booking refund',
        reference_id: bookingId,
        status: WalletTransactionStatus.COMPLETED,
      })
      .select()
      .single();

    if (error) throw error;

    // Update wallet balance
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ balance: balanceAfter })
      .eq('id', walletId);

    if (updateError) throw updateError;

    return keysToCamel(data) as WalletTransaction;
  }

  async getTransactionsPaginated(
    userId: string,
    page = PAGINATION.PAGE_OFFSET,
    limit = PAGINATION.PAGE_LIMIT_MAX,
  ): Promise<WalletTransaction[]> {
    const wallet = await this.getWallet(userId);

    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return keysToCamel(data) as WalletTransaction[];
  }
}

export const walletService = WalletService.getInstance();
