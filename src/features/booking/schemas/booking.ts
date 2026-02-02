/* eslint-disable @typescript-eslint/no-empty-object-type */
// Effect
import { Schema } from 'effect';

// Type
import { ShowTime } from './cinema';

export const BookingStatusSchema = Schema.Literal(
  'active',
  'cancelled',
  'expired',
  'used',
);
export const PaymentStatusSchema = Schema.Literal(
  'pending',
  'paid',
  'failed',
  'refunded',
);

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
  paymentStatus: PaymentStatusSchema,
  bookingStatus: BookingStatusSchema,
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
  status: Schema.optional(BookingStatusSchema),
  scannedAt: Schema.optional(Schema.String),
  createdAt: Schema.String,
});

// Types
export type BookingStatus = Schema.Schema.Type<typeof BookingStatusSchema>;
export type PaymentStatus = Schema.Schema.Type<typeof PaymentStatusSchema>;

// Interface
export interface TicketBase extends Schema.Schema.Type<typeof TicketSchema> {}
export interface BookingBase extends Schema.Schema.Type<typeof BookingSchema> {}

export interface Booking extends BookingBase {
  showtime?: ShowTime;
  tickets?: TicketBase[];
}

export interface Ticket extends TicketBase {
  booking?: Booking;
}

export interface InfiniteBookingsData {
  pages: Booking[][];
  pageParams: number[];
}
