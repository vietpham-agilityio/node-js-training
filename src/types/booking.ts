import { Showtime } from './cinema';

export interface Ticket {
  id: string;
  bookingId: string;
  seatNumber: string;
  ticketNumber: string;
  qrCodeData: string;
  price: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
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
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  bookingStatus: 'active' | 'cancelled' | 'expired' | 'used';
  expiresAt: string;
  qrCodeData?: string;
  createdAt: string;
  updatedAt: string;
  showtime?: Showtime;
  tickets?: Ticket[];
}
