import { Showtime } from '@/features/booking/schemas/cinema';
import {
  filterShowtimesByTime,
  formatShowtimes,
  getDayOfWeekLabels,
  getMinimumShowtime,
} from '../dates';

// Mock types
const createMockShowtime = (
  showTime: string,
  cinemaId: string,
  hallId: string,
) => ({
  id: `showtime-${showTime}`,
  movieId: 'movie-1',
  cinemaHallId: hallId,
  showTime,
  showDate: '2024-01-15',
  price: 50000,
  cinemaHall: {
    id: hallId,
    cinemaId,
    name: 'Hall 1',
    cinema: {
      id: cinemaId,
      name: `Cinema ${cinemaId}`,
      location: 'Location',
      address: 'Address',
      city: 'City',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  },
});

describe('getDayOfWeekLabels', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return 5 day labels', () => {
    jest.setSystemTime(new Date('2024-01-15')); // Monday
    const labels = getDayOfWeekLabels();
    expect(labels).toHaveLength(5);
  });

  it('should include day name and number', () => {
    jest.setSystemTime(new Date('2024-01-15')); // Monday
    const labels = getDayOfWeekLabels();
    expect(labels[0]?.label).toMatch('MON');
  });

  it('should include date string in YYYY-MM-DD format', () => {
    jest.setSystemTime(new Date('2024-01-15'));
    const labels = getDayOfWeekLabels();
    expect(labels[0]?.dayNumber).toMatch(/^\d+$/);
  });

  it('should start from today', () => {
    jest.setSystemTime(new Date('2024-01-15'));
    const labels = getDayOfWeekLabels();
    expect(labels[0]?.label).toBe('MON');
  });

  it('should have unique IDs', () => {
    jest.setSystemTime(new Date('2024-01-15'));
    const labels = getDayOfWeekLabels();
    const ids = labels.map(l => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('getMinimumShowtime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should round up to next 30-minute interval', () => {
    jest.setSystemTime(new Date('2024-01-15T10:15:00'));
    const result = getMinimumShowtime();
    expect(result).toBe('10:30');
  });

  it('should return current hour with 00 minutes if minute is 0', () => {
    jest.setSystemTime(new Date('2024-01-15T10:00:00'));
    const result = getMinimumShowtime();
    expect(result).toBe('10:00');
  });

  it('should return current hour with 30 minutes if minute is <= 30', () => {
    jest.setSystemTime(new Date('2024-01-15T10:30:00'));
    const result = getMinimumShowtime();
    expect(result).toBe('10:30');
  });

  it('should round up to next hour if minute > 30', () => {
    jest.setSystemTime(new Date('2024-01-15T10:45:00'));
    const result = getMinimumShowtime();
    expect(result).toBe('11:00');
  });

  it('should return null if time is past 23:00', () => {
    jest.setSystemTime(new Date('2024-01-15T23:15:00'));
    const result = getMinimumShowtime();
    expect(result).toBeNull();
  });

  it('should return null if time is exactly 23:00 with minutes > 0', () => {
    jest.setSystemTime(new Date('2024-01-15T23:01:00'));
    const result = getMinimumShowtime();
    expect(result).toBeNull();
  });

  it('should format time with leading zeros', () => {
    jest.setSystemTime(new Date('2024-01-15T09:15:00'));
    const result = getMinimumShowtime();
    expect(result).toBe('09:30');
  });
});

describe('filterShowtimesByTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return all showtimes if showDate is not today', () => {
    jest.setSystemTime(new Date('2024-01-15T10:00:00'));
    const showtimes = [
      createMockShowtime('09:00', 'cinema-1', 'hall-1'),
      createMockShowtime('10:00', 'cinema-1', 'hall-1'),
      createMockShowtime('11:00', 'cinema-1', 'hall-1'),
    ];
    showtimes[0]!.showDate = '2024-01-16';
    showtimes[1]!.showDate = '2024-01-16';
    showtimes[2]!.showDate = '2024-01-16';

    const result = filterShowtimesByTime(showtimes as Showtime[], '2024-01-16');
    expect(result).toHaveLength(3);
  });

  it('should filter out past showtimes for today', () => {
    jest.setSystemTime(new Date('2024-01-15T10:15:00'));
    const today = '2024-01-15';
    const showtimes = [
      createMockShowtime('09:00', 'cinema-1', 'hall-1'),
      createMockShowtime('10:30', 'cinema-1', 'hall-1'),
      createMockShowtime('11:00', 'cinema-1', 'hall-1'),
    ];
    showtimes.forEach(s => (s.showDate = today));

    const result = filterShowtimesByTime(showtimes as Showtime[], today);
    expect(result).toHaveLength(2); // 10:30 and 11:00
    expect(result[0]?.showTime).toBe('10:30');
  });

  it('should return empty array if past 23:00', () => {
    jest.setSystemTime(new Date('2024-01-15T23:15:00'));
    const today = '2024-01-15';
    const showtimes = [
      createMockShowtime('22:00', 'cinema-1', 'hall-1'),
      createMockShowtime('23:00', 'cinema-1', 'hall-1'),
    ];
    showtimes.forEach(s => (s.showDate = today));

    const result = filterShowtimesByTime(showtimes as Showtime[], today);
    expect(result).toHaveLength(0);
  });

  it('should filter out showtimes after 23:00', () => {
    jest.setSystemTime(new Date('2024-01-15T10:00:00'));
    const today = '2024-01-15';
    const showtimes = [
      createMockShowtime('22:00', 'cinema-1', 'hall-1'),
      createMockShowtime('23:00', 'cinema-1', 'hall-1'),
      createMockShowtime('23:30', 'cinema-1', 'hall-1'),
    ];
    showtimes.forEach(s => (s.showDate = today));

    const result = filterShowtimesByTime(showtimes as Showtime[], today);
    expect(result.every(s => s.showTime <= '23:00')).toBe(true);
  });

  it('should handle HH:MM:SS format', () => {
    jest.setSystemTime(new Date('2024-01-15T10:15:00'));
    const today = '2024-01-15';
    const showtime = createMockShowtime('10:30:00', 'cinema-1', 'hall-1');
    showtime.showDate = today;

    const result = filterShowtimesByTime([showtime as Showtime], today);
    expect(result).toHaveLength(1);
  });
});

describe('formatShowtimes', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should group showtimes by cinema', () => {
    const showtimes = [
      createMockShowtime('11:00', 'cinema-1', 'hall-1'),
      createMockShowtime('12:00', 'cinema-1', 'hall-1'),
      createMockShowtime('11:00', 'cinema-2', 'hall-2'),
    ];
    showtimes.forEach(s => (s.showDate = '2024-01-16'));

    const result = formatShowtimes(showtimes as Showtime[], '2024-01-16');
    expect(result).toHaveLength(2);
    expect(result[0]!.cinema.id).toBe('cinema-1');
    expect(result[0]!.showtimes).toHaveLength(2);
    expect(result[1]!.cinema.id).toBe('cinema-2');
    expect(result[1]!.showtimes).toHaveLength(1);
  });

  it('should sort showtimes by time within each cinema', () => {
    const showtimes = [
      createMockShowtime('12:00', 'cinema-1', 'hall-1'),
      createMockShowtime('11:00', 'cinema-1', 'hall-1'),
      createMockShowtime('13:00', 'cinema-1', 'hall-1'),
    ];
    showtimes.forEach(s => (s.showDate = '2024-01-16'));

    const result = formatShowtimes(showtimes as Showtime[], '2024-01-16');
    expect(result[0]?.showtimes[0]?.showTime).toBe('11:00');
    expect(result[0]?.showtimes[1]?.showTime).toBe('12:00');
    expect(result[0]?.showtimes[2]?.showTime).toBe('13:00');
  });

  it('should sort cinemas alphabetically by name', () => {
    const showtimes = [
      createMockShowtime('11:00', 'cinema-z', 'hall-1'),
      createMockShowtime('11:00', 'cinema-a', 'hall-2'),
      createMockShowtime('11:00', 'cinema-m', 'hall-3'),
    ];
    showtimes.forEach(s => (s.showDate = '2024-01-16'));

    const result = formatShowtimes(showtimes as Showtime[], '2024-01-16');
    expect(result[0]?.cinema.name).toBe('Cinema cinema-a');
    expect(result[1]?.cinema.name).toBe('Cinema cinema-m');
    expect(result[2]?.cinema.name).toBe('Cinema cinema-z');
  });

  it('should filter showtimes by time for today', () => {
    jest.setSystemTime(new Date('2024-01-15T10:15:00'));
    const today = '2024-01-15';
    const showtimes = [
      createMockShowtime('09:00', 'cinema-1', 'hall-1'),
      createMockShowtime('10:30', 'cinema-1', 'hall-1'),
      createMockShowtime('11:00', 'cinema-1', 'hall-1'),
    ];
    showtimes.forEach(s => (s.showDate = today));

    const result = formatShowtimes(showtimes as Showtime[], today);
    expect(result[0]?.showtimes).toHaveLength(2); // Only 10:30 and 11:00
  });

  it('should skip showtimes without cinemaHall', () => {
    const showtimes = [
      createMockShowtime('11:00', 'cinema-1', 'hall-1'),
      {
        ...createMockShowtime('11:00', 'cinema-2', 'hall-2'),
        cinemaHall: null,
      },
    ];
    showtimes.forEach(s => (s.showDate = '2024-01-16'));

    const result = formatShowtimes(showtimes as Showtime[], '2024-01-16');
    expect(result).toHaveLength(1);
    expect(result[0]?.cinema.id).toBe('cinema-1');
  });

  it('should skip showtimes without cinema', () => {
    const showtime = createMockShowtime('11:00', 'cinema-1', 'hall-1');
    showtime.showDate = '2024-01-16';
    if (showtime.cinemaHall) {
      showtime.cinemaHall.cinema = undefined as any;
    }

    const result = formatShowtimes([showtime as Showtime], '2024-01-16');
    expect(result).toHaveLength(0);
  });

  it('should return empty array for empty input', () => {
    const result = formatShowtimes([], '2024-01-16');
    expect(result).toHaveLength(0);
  });
});
