import { ShowTime } from '@/features/booking/schemas/cinema';
import {
  filterShowTimesByTime,
  formatShowTimes,
  getDayOfWeekLabels,
  getMinimumShowtime,
} from '../dates';

// Mock types
const createMockShowTime = (
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
      createMockShowTime('09:00', 'cinema-1', 'hall-1'),
      createMockShowTime('10:00', 'cinema-1', 'hall-1'),
      createMockShowTime('11:00', 'cinema-1', 'hall-1'),
    ];
    showtimes[0]!.showDate = '2024-01-16';
    showtimes[1]!.showDate = '2024-01-16';
    showtimes[2]!.showDate = '2024-01-16';

    const result = filterShowTimesByTime(showtimes as ShowTime[], '2024-01-16');
    expect(result).toHaveLength(3);
  });

  it('should filter out past showtimes for today', () => {
    jest.setSystemTime(new Date('2024-01-15T10:15:00'));
    const today = '2024-01-15';
    const showtimes = [
      createMockShowTime('09:00', 'cinema-1', 'hall-1'),
      createMockShowTime('10:30', 'cinema-1', 'hall-1'),
      createMockShowTime('11:00', 'cinema-1', 'hall-1'),
    ];
    showtimes.forEach(s => (s.showDate = today));

    const result = filterShowTimesByTime(showtimes as ShowTime[], today);
    expect(result).toHaveLength(2); // 10:30 and 11:00
    expect(result[0]?.showTime).toBe('10:30');
  });

  it('should return empty array if past 23:00', () => {
    jest.setSystemTime(new Date('2024-01-15T23:15:00'));
    const today = '2024-01-15';
    const showtimes = [
      createMockShowTime('22:00', 'cinema-1', 'hall-1'),
      createMockShowTime('23:00', 'cinema-1', 'hall-1'),
    ];
    showtimes.forEach(s => (s.showDate = today));

    const result = filterShowTimesByTime(showtimes as ShowTime[], today);
    expect(result).toHaveLength(0);
  });

  it('should filter out showtimes after 23:00', () => {
    jest.setSystemTime(new Date('2024-01-15T10:00:00'));
    const today = '2024-01-15';
    const showtimes = [
      createMockShowTime('22:00', 'cinema-1', 'hall-1'),
      createMockShowTime('23:00', 'cinema-1', 'hall-1'),
      createMockShowTime('23:30', 'cinema-1', 'hall-1'),
    ];
    showtimes.forEach(s => (s.showDate = today));

    const result = filterShowTimesByTime(showtimes as ShowTime[], today);
    expect(result.every(s => s.showTime <= '23:00')).toBe(true);
  });

  it('should handle HH:MM:SS format', () => {
    jest.setSystemTime(new Date('2024-01-15T10:15:00'));
    const today = '2024-01-15';
    const showtime = createMockShowTime('10:30:00', 'cinema-1', 'hall-1');
    showtime.showDate = today;

    const result = filterShowTimesByTime([showtime as ShowTime], today);
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

  it('should group showTimes by cinema', () => {
    const showTimes = [
      createMockShowTime('11:00', 'cinema-1', 'hall-1'),
      createMockShowTime('12:00', 'cinema-1', 'hall-1'),
      createMockShowTime('11:00', 'cinema-2', 'hall-2'),
    ];
    showTimes.forEach(s => (s.showDate = '2024-01-16'));

    const result = formatShowTimes(showTimes as ShowTime[], '2024-01-16');
    expect(result).toHaveLength(2);
    expect(result[0]!.cinema.id).toBe('cinema-1');
    expect(result[0]!.showTimes).toHaveLength(2);
    expect(result[1]!.cinema.id).toBe('cinema-2');
    expect(result[1]!.showTimes).toHaveLength(1);
  });

  it('should sort showTimes by time within each cinema', () => {
    const showTimes = [
      createMockShowTime('12:00', 'cinema-1', 'hall-1'),
      createMockShowTime('11:00', 'cinema-1', 'hall-1'),
      createMockShowTime('13:00', 'cinema-1', 'hall-1'),
    ];
    showTimes.forEach(s => (s.showDate = '2024-01-16'));

    const result = formatShowTimes(showTimes as ShowTime[], '2024-01-16');
    expect(result[0]?.showTimes[0]?.showTime).toBe('11:00');
    expect(result[0]?.showTimes[1]?.showTime).toBe('12:00');
    expect(result[0]?.showTimes[2]?.showTime).toBe('13:00');
  });

  it('should sort cinemas alphabetically by name', () => {
    const showTimes = [
      createMockShowTime('11:00', 'cinema-z', 'hall-1'),
      createMockShowTime('11:00', 'cinema-a', 'hall-2'),
      createMockShowTime('11:00', 'cinema-m', 'hall-3'),
    ];
    showTimes.forEach(s => (s.showDate = '2024-01-16'));

    const result = formatShowTimes(showTimes as ShowTime[], '2024-01-16');
    expect(result[0]?.cinema.name).toBe('Cinema cinema-a');
    expect(result[1]?.cinema.name).toBe('Cinema cinema-m');
    expect(result[2]?.cinema.name).toBe('Cinema cinema-z');
  });

  it('should filter showTimes by time for today', () => {
    jest.setSystemTime(new Date('2024-01-15T10:15:00'));
    const today = '2024-01-15';
    const showTimes = [
      createMockShowTime('09:00', 'cinema-1', 'hall-1'),
      createMockShowTime('10:30', 'cinema-1', 'hall-1'),
      createMockShowTime('11:00', 'cinema-1', 'hall-1'),
    ];
    showTimes.forEach(s => (s.showDate = today));

    const result = formatShowTimes(showTimes as ShowTime[], today);
    expect(result[0]?.showTimes).toHaveLength(2); // Only 10:30 and 11:00
  });

  it('should skip showTimes without cinemaHall', () => {
    const showTimes = [
      createMockShowTime('11:00', 'cinema-1', 'hall-1'),
      {
        ...createMockShowTime('11:00', 'cinema-2', 'hall-2'),
        cinemaHall: null,
      },
    ];
    showTimes.forEach(s => (s.showDate = '2024-01-16'));

    const result = formatShowTimes(showTimes as ShowTime[], '2024-01-16');
    expect(result).toHaveLength(1);
    expect(result[0]?.cinema.id).toBe('cinema-1');
  });

  it('should skip showTimes without cinema', () => {
    const showTime = createMockShowTime('11:00', 'cinema-1', 'hall-1');
    showTime.showDate = '2024-01-16';
    if (showTime.cinemaHall) {
      showTime.cinemaHall.cinema = undefined as any;
    }

    const result = formatShowTimes([showTime as ShowTime], '2024-01-16');
    expect(result).toHaveLength(0);
  });

  it('should return empty array for empty input', () => {
    const result = formatShowTimes([], '2024-01-16');
    expect(result).toHaveLength(0);
  });
});
