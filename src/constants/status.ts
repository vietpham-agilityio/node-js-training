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
import { PromoCodeStatus, MovieStatus } from '@/features/booking/schemas/movie';

export const BOOKING_STATUS: Record<string, BookingStatus> = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  USED: 'used',
};

export const PAYMENT_STATUS: Record<string, PaymentStatus> = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const SHOWTIME_STATUS: Record<string, ShowtimeStatus> = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const SEAT_RESERVATION_STATUS: Record<string, SeatReservationStatus> = {
  CONFIRMED: 'confirmed',
  RESERVED: 'reserved',
  RELEASED: 'released',
};

export const SEAT_STATUS: Record<string, SeatStatus> = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  SELECTED: 'selected',
};

export const MOVIE_STATUS: Record<string, MovieStatus> = {
  NOW_PLAYING: 'now_playing',
  COMING_SOON: 'coming_soon',
  ENDED: 'ended',
};

export const PROMO_CODE_STATUS: Record<string, PromoCodeStatus> = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
};
