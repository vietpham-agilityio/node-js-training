// Schemas
import {
  BookingStatus,
  PaymentStatus,
} from '@/features/booking/schemas/booking';
import {
  SeatReservationStatus,
  SeatStatus,
  ShowtimeStatus,
} from '@/features/booking/schemas/cinema';
import { MovieStatus, PromoCodeStatus } from '@/features/booking/schemas/movie';
import {
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/features/wallet/schemas/wallet';

export const BOOKING_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  USED: 'used',
} as const satisfies Record<string, BookingStatus>;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const satisfies Record<string, PaymentStatus>;

export const SHOWTIME_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const satisfies Record<string, ShowtimeStatus>;

export const SEAT_RESERVATION_STATUS = {
  CONFIRMED: 'confirmed',
  RESERVED: 'reserved',
  RELEASED: 'released',
} as const satisfies Record<string, SeatReservationStatus>;

export const SEAT_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  SELECTED: 'selected',
} as const satisfies Record<string, SeatStatus>;

export const MOVIE_STATUS = {
  NOW_PLAYING: 'now_playing',
  COMING_SOON: 'coming_soon',
  ENDED: 'ended',
} as const satisfies Record<string, MovieStatus>;

export const PROMO_CODE_STATUS = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
} as const satisfies Record<string, PromoCodeStatus>;

export const WALLET_TRANSACTION_TYPE = {
  TOP_UP: 'top_up',
  PAYMENT: 'payment',
  REFUND: 'refund',
} as const satisfies Record<string, WalletTransactionType>;

export const WALLET_TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const satisfies Record<string, WalletTransactionStatus>;
