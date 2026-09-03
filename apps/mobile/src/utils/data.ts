import { Effect } from 'effect';

// Constants
import { SEAT_STATUS } from '@/constants/status';
import { ROWS, COLUMN_COUNT, BOOKED_PROBABILITY } from '@/constants/configs';

// Schemas
import { Seat, SeatStatus } from '@/features/booking/schemas/cinema';

/**
 * Effect that generates a seat layout: rows A–J, columns 1–10.
 * Randomly marks about 20% of seats as booked.
 */
export const generateSeatsEffect = (): Effect.Effect<Seat[]> =>
  Effect.sync(() => {
    const seats: Seat[] = [];
    for (const row of ROWS) {
      for (let num = 1; num <= COLUMN_COUNT; num++) {
        const seatId = `${row}${num}`;
        const isBooked = Math.random() < BOOKED_PROBABILITY;
        seats.push({
          id: seatId,
          row,
          number: num,
          status: isBooked
            ? (SEAT_STATUS.BOOKED as SeatStatus)
            : (SEAT_STATUS.AVAILABLE as SeatStatus),
        });
      }
    }
    return seats;
  });

/**
 * Generate seat layout: rows A–J, columns 1–10.
 * Randomly marks about 20% of seats as booked.
 */
export const generateSeats = (): Seat[] =>
  Effect.runSync(generateSeatsEffect());
