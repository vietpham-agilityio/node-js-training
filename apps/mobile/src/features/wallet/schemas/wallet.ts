/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Booking } from '@/features/booking/schemas/booking';
import { Schema } from 'effect';

export const WalletTransactionTypeSchema = Schema.Literal(
  'top_up',
  'payment',
  'refund',
);

export const WalletTransactionStatusSchema = Schema.Literal(
  'pending',
  'completed',
  'failed',
);

export const WalletSchema = Schema.Struct({
  id: Schema.String,
  userId: Schema.String,
  balance: Schema.Number,
  currency: Schema.String,
  cardNumber: Schema.String,
  isActive: Schema.Boolean,
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export const WalletTransactionSchema = Schema.Struct({
  id: Schema.String,
  walletId: Schema.String,
  transactionType: WalletTransactionTypeSchema,
  amount: Schema.Number,
  balanceBefore: Schema.Number,
  balanceAfter: Schema.Number,
  description: Schema.String,
  referenceId: Schema.optional(Schema.String),
  status: WalletTransactionStatusSchema,
  createdAt: Schema.String,
});

export type WalletTransactionType = Schema.Schema.Type<
  typeof WalletTransactionTypeSchema
>;
export type WalletTransactionStatus = Schema.Schema.Type<
  typeof WalletTransactionStatusSchema
>;

export interface Wallet extends Schema.Schema.Type<typeof WalletSchema> {}
export interface WalletTransactionBase extends Schema.Schema.Type<
  typeof WalletTransactionSchema
> {}

export interface WalletTransaction extends WalletTransactionBase {
  booking?: Booking;
}
