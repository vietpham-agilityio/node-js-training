import { SeatStatus } from '@/features/booking/schemas/cinema';
import { generateSeats } from '../data';
import { SEAT_STATUS } from '@/constants/status';

// Mock Math.random to make tests deterministic
const mockMathRandom = jest.spyOn(Math, 'random');

describe('generateSeats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockMathRandom.mockRestore();
  });

  it('should generate seats for rows A-J', () => {
    mockMathRandom.mockReturnValue(0); // All seats available
    const seats = generateSeats();

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    rows.forEach(row => {
      const rowSeats = seats.filter(seat => seat?.row === row);
      expect(rowSeats).toHaveLength(10);
    });
  });

  it('should generate seats with numbers 1-10 for each row', () => {
    mockMathRandom.mockReturnValue(0); // All seats available
    const seats = generateSeats();

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    rows.forEach(row => {
      for (let num = 1; num <= 10; num++) {
        const seat = seats.find(s => s?.row === row && s?.number === num);
        expect(seat).toBeDefined();
        expect(seat?.id).toBe(`${row}${num}`);
      }
    });
  });

  it('should generate 100 seats total (10 rows × 10 seats)', () => {
    mockMathRandom.mockReturnValue(0); // All seats available
    const seats = generateSeats();

    expect(seats).toHaveLength(100);
  });

  it('should mark some seats as booked when random < 0.2', () => {
    mockMathRandom.mockReturnValue(0.1); // All seats booked
    const seats = generateSeats();

    const bookedSeats = seats.filter(
      seat => seat?.status === SEAT_STATUS.BOOKED,
    );
    expect(bookedSeats.length).toBeGreaterThan(0);
    expect(bookedSeats.every(seat => seat?.status === SEAT_STATUS.BOOKED)).toBe(
      true,
    );
  });

  it('should mark seats as available when random >= 0.2', () => {
    mockMathRandom.mockReturnValue(0.5); // All seats available
    const seats = generateSeats();

    const availableSeats = seats.filter(
      seat => seat?.status === SEAT_STATUS.AVAILABLE,
    );
    expect(availableSeats.length).toBeGreaterThan(0);
    expect(
      availableSeats.every(seat => seat?.status === SEAT_STATUS.AVAILABLE),
    ).toBe(true);
  });

  it('should generate unique seat IDs', () => {
    mockMathRandom.mockReturnValue(0);
    const seats = generateSeats();

    const seatIds = seats.map(seat => seat?.id);
    const uniqueIds = new Set(seatIds);

    expect(uniqueIds.size).toBe(seatIds.length);
  });

  it('should have correct seat structure', () => {
    mockMathRandom.mockReturnValue(0);
    const seats = generateSeats();

    seats.forEach(seat => {
      expect(seat).toHaveProperty('id');
      expect(seat).toHaveProperty('row');
      expect(seat).toHaveProperty('number');
      expect(seat).toHaveProperty('status');
      expect(typeof seat.id).toBe('string');
      expect(typeof seat.row).toBe('string');
      expect(typeof seat.number).toBe('number');
      expect([SEAT_STATUS.AVAILABLE, SEAT_STATUS.BOOKED]).toContain(
        seat.status,
      );
    });
  });

  it('should generate seats in correct order', () => {
    mockMathRandom.mockReturnValue(0);
    const seats = generateSeats();

    // Check first seat
    expect(seats[0]?.row).toBe('A');
    expect(seats[0]?.number).toBe(1);

    // Check last seat
    expect(seats[99]?.row).toBe('J');
    expect(seats[99]?.number).toBe(10);
  });
});
