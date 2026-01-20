/* eslint-disable @typescript-eslint/no-empty-object-type */
// Effect
import { Schema } from 'effect';

// Type
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

export const BookingSchema = Schema.Struct({
  id: Schema.String,
  userId: Schema.String,
  showtimeId: Schema.String,
  bookingNumber: Schema.String,
  totalSeats: Schema.Number,
  seatNumbers: Schema.Array(Schema.String),
  subtotal: Schema.Number,
  discountAmount: Schema.Number,
  totalAmount: Schema.Number,
  promoCodeId: Schema.optional(Schema.String),
  paymentMethod: Schema.String,
  paymentStatus: Schema.Enums(PaymentStatus),
  bookingStatus: Schema.Enums(BookingStatus),
  expiresAt: Schema.String,
  qrCodeData: Schema.optional(Schema.String),
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export const TicketSchema = Schema.Struct({
  id: Schema.String,
  bookingId: Schema.String,
  seatNumber: Schema.String,
  ticketNumber: Schema.String,
  qrCodeData: Schema.String,
  price: Schema.Number,
  status: Schema.optional(Schema.Enums(TicketStatus)),
  scannedAt: Schema.optional(Schema.String),
  createdAt: Schema.String,
  booking: Schema.optional(BookingSchema),
});

export interface Ticket extends Schema.Schema.Type<typeof TicketSchema> {}
export interface BookingBase extends Schema.Schema.Type<typeof BookingSchema> {}

export interface Booking extends BookingBase {
  showtime?: Showtime;
  tickets?: Ticket[];
}

export interface InfiniteBookingsData {
  pages: Booking[][];
  pageParams: number[];
}
