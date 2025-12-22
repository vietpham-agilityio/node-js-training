// Supabase
import { supabase } from '@/services/supabase/client';

// Constants
import { PAGINATION } from '@/constants';

// Types
import {
  Wallet,
  WalletTransaction,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/features/wallet/types/wallet';

// Utils
import { keysToCamel } from '@/utils/convert';

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
    try {
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

      if (error) {
        throw error;
      }

      return keysToCamel(data) as Wallet;
    } catch (error) {
      throw error;
    }
  }

  async getWallet(userId: string): Promise<Wallet> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select(
          'id, user_id, balance, currency, card_number, is_active, created_at, updated_at',
        )
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return keysToCamel(data) as Wallet;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get wallet transactions
   * Instead fetches transactions first, then enriches with booking data
   */
  async getTransactions(
    userId: string,
    limit = PAGINATION.PAGE_LIMIT_MAX,
  ): Promise<WalletTransaction[]> {
    try {
      // Get wallet first (RLS filters automatically)
      const wallet = await this.getWallet(userId);

      // Get transactions for this wallet
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(
          `
          id,
          wallet_id,
          transaction_type,
          amount,
          balance_before,
          balance_after,
          description,
          reference_id,
          status,
          created_at
        `,
        )
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      // Enrich transactions with booking data
      const enrichedTransactions = await Promise.all(
        (data || []).map(async transaction => {
          // If transaction has a booking reference, fetch booking details
          if (transaction.reference_id) {
            try {
              const { data: booking } = await supabase
                .from('bookings')
                .select(
                  `
                  id,
                  booking_number,
                  total_seats,
                  seat_numbers,
                  showtime:showtimes!inner(
                    id,
                    show_date,
                    show_time,
                    movie:movies!inner(
                      id,
                      title,
                      poster_url,
                      genre,
                      duration_minutes
                    ),
                    cinema_hall:cinema_halls!inner(
                      id,
                      name,
                      cinema:cinemas!inner(
                        id,
                        name,
                        city
                      )
                    )
                  )
                `,
                )
                .eq('id', transaction.reference_id)
                .single();

              return {
                ...transaction,
                booking: booking || null,
              };
            } catch {
              // If booking fetch fails, return transaction without booking
              return {
                ...transaction,
                booking: null,
              };
            }
          }

          return {
            ...transaction,
            booking: null,
          };
        }),
      );

      return keysToCamel(enrichedTransactions) as WalletTransaction[];
    } catch (error) {
      throw error;
    }
  }

  async topUp(walletId: string, amount: number): Promise<WalletTransaction> {
    try {
      // Get current wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', walletId)
        .single();

      if (walletError) {
        throw walletError;
      }

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

      if (error) {
        throw error;
      }

      // Update wallet balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          balance: balanceAfter,
          updated_at: new Date().toISOString(),
        })
        .eq('id', walletId);

      if (updateError) {
        throw updateError;
      }

      return keysToCamel(data) as WalletTransaction;
    } catch (error) {
      throw error;
    }
  }

  async processPurchase(
    walletId: string,
    amount: number,
    bookingId: string,
    description: string,
  ): Promise<WalletTransaction> {
    try {
      // Get current wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', walletId)
        .single();

      if (walletError) {
        throw walletError;
      }

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
          transaction_type: WalletTransactionType.PAYMENT,
          amount: -amount, // Negative for deduction
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description,
          reference_id: bookingId,
          status: WalletTransactionStatus.COMPLETED,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update wallet balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          balance: balanceAfter,
          updated_at: new Date().toISOString(),
        })
        .eq('id', walletId);

      if (updateError) {
        throw updateError;
      }

      return keysToCamel(data) as WalletTransaction;
    } catch (error) {
      throw error;
    }
  }

  async refund(
    walletId: string,
    amount: number,
    bookingId: string,
  ): Promise<WalletTransaction> {
    try {
      // Get current wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', walletId)
        .single();

      if (walletError) {
        throw walletError;
      }

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

      if (error) {
        throw error;
      }

      // Update wallet balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          balance: balanceAfter,
          updated_at: new Date().toISOString(),
        })
        .eq('id', walletId);

      if (updateError) {
        throw updateError;
      }

      return keysToCamel(data) as WalletTransaction;
    } catch (error) {
      throw error;
    }
  }

  async getTransactionsPaginated(
    userId: string,
    page = PAGINATION.PAGE_OFFSET,
    limit = PAGINATION.PAGE_LIMIT_MAX,
  ): Promise<WalletTransaction[]> {
    try {
      const wallet = await this.getWallet(userId);

      // Get paginated transactions
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(
          `
          id,
          wallet_id,
          transaction_type,
          amount,
          balance_before,
          balance_after,
          description,
          reference_id,
          status,
          created_at
        `,
        )
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) {
        throw error;
      }

      // Enrich with booking data (only for transactions with reference_id)
      const enrichedTransactions = await Promise.all(
        (data || []).map(async transaction => {
          if (transaction.reference_id) {
            try {
              const { data: booking } = await supabase
                .from('bookings')
                .select(
                  `
                  id,
                  booking_number,
                  total_seats,
                  seat_numbers,
                  showtime:showtimes!inner(
                    id,
                    show_date,
                    show_time,
                    movie:movies!inner(
                      id,
                      title,
                      poster_url,
                      genre,
                      duration_minutes
                    ),
                    cinema_hall:cinema_halls!inner(
                      id,
                      name,
                      cinema:cinemas!inner(
                        id,
                        name,
                        city
                      )
                    )
                  )
                `,
                )
                .eq('id', transaction.reference_id)
                .single();

              return { ...transaction, booking: booking || null };
            } catch {
              return { ...transaction, booking: null };
            }
          }

          return { ...transaction, booking: null };
        }),
      );

      return keysToCamel(enrichedTransactions) as WalletTransaction[];
    } catch (error) {
      throw error;
    }
  }
}

export const walletService = WalletService.getInstance();
