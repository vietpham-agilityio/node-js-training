import { Arbitrary, FastCheck, Schema } from 'effect';

// Constants
import { PROMO_CODE_STATUS } from '@/constants/status';

// Schemas
import {
  BookingSchema,
  TicketSchema,
} from '@/features/booking/schemas/booking';
import {
  CinemaHallSchema,
  CinemaSchema,
  ShowtimeSchema,
} from '@/features/booking/schemas/cinema';
import {
  Movie,
  MovieSchema,
  PromoCode,
  PromoCodeStatus,
} from '@/features/booking/schemas/movie';

const CinemaForMockSchema = Schema.Struct({
  ...CinemaSchema.fields,
  phoneNumber: Schema.String,
  facilities: Schema.Array(Schema.String),
});

const CinemaHallWithCinemaSchema = Schema.Struct({
  ...CinemaHallSchema.fields,
  cinema: CinemaForMockSchema,
});
const ShowtimeWithRelationsSchema = Schema.Struct({
  ...ShowtimeSchema.fields,
  movie: MovieSchema,
  cinemaHall: CinemaHallWithCinemaSchema,
});
const BookingWithShowtimeSchema = Schema.Struct({
  ...BookingSchema.fields,
  showtime: ShowtimeWithRelationsSchema,
});
const TicketWithBookingSchema = Schema.Struct({
  ...TicketSchema.fields,
  booking: BookingWithShowtimeSchema,
});

const ticketArb = Arbitrary.make(TicketWithBookingSchema);
export const MOCK_TICKET = FastCheck.sample(ticketArb, {
  seed: 42,
  numRuns: 1,
})[0];

const movieArb = Arbitrary.make(MovieSchema);

export const MOCK_PROMOTIONS: PromoCode[] = [
  {
    id: '1',
    code: 'Student Holiday',
    description: 'Maximal only for two people',
    discountType: PROMO_CODE_STATUS.PERCENTAGE as PromoCodeStatus,
    discountValue: 50,
  },
  {
    id: '2',
    code: 'Student Holiday',
    description: 'Maximal only for two people',
    discountType: PROMO_CODE_STATUS.PERCENTAGE as PromoCodeStatus,
    discountValue: 50,
  },
  {
    id: '3',
    code: 'Student Holiday',
    description: 'Maximal only for two people',
    discountType: PROMO_CODE_STATUS.PERCENTAGE as PromoCodeStatus,
    discountValue: 50,
  },
];

export const MOCK_ORDER_DETAIL = {
  idOrder: '22081996',
  cinema: 'FX Sudirman XXI',
  dateTime: 'Sun May 22, 16:40',
  seatNumber: 'D7,D8,D9',
  pricePerTicket: 50000,
  quantity: 3,
};

export const MOCK_MOVIES: Movie[] = FastCheck.sample(movieArb, {
  seed: 42,
  numRuns: 1,
}) as Movie[];

export const MOCK_WALLET_BALANCE = 200000;
