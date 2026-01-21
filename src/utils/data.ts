import { SEAT_STATUS } from '@/constants/status';
import { Seat, SeatStatus } from '@/features/booking/schemas/cinema';

// Generate seat layout: Rows A-J, Columns 1-10
export const generateSeats = (): Seat[] => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seats: Seat[] = [];

  rows.forEach(row => {
    for (let num = 1; num <= 10; num++) {
      const seatId = `${row}${num}`;
      // Randomly mark some seats as booked (about 20%)
      const isBooked = Math.random() < 0.2;
      seats.push({
        id: seatId,
        row,
        number: num,
        status: isBooked
          ? (SEAT_STATUS.BOOKED as SeatStatus)
          : (SEAT_STATUS.AVAILABLE as SeatStatus),
      });
    }
  });

  return seats;
};
