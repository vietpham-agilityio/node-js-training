import { Showtime } from './cinema';

export enum TicketStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum BookingStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  USED = 'used',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface Ticket {
  id: string;
  bookingId: string;
  seatNumber: string;
  ticketNumber: string;
  qrCodeData: string;
  price: number;
  status: TicketStatus;
  scannedAt?: string;
  createdAt: string;
  booking?: Booking;
}

export interface Booking {
  id: string;
  userId: string;
  showtimeId: string;
  bookingNumber: string;
  totalSeats: number;
  seatNumbers: string[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  promoCodeId?: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  expiresAt: string;
  qrCodeData?: string;
  createdAt: string;
  updatedAt: string;
  showtime?: Showtime;
  tickets?: Ticket[];
}
