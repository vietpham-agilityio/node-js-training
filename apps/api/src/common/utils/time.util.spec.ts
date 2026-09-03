import { dateTimeToInstant, showtimeEndInstant } from './time.util';

describe('dateTimeToInstant', () => {
  it('anchors a date and time as a UTC instant', () => {
    expect(dateTimeToInstant('2026-09-01', '19:30:00')).toEqual(
      new Date('2026-09-01T19:30:00Z'),
    );
  });
});

describe('showtimeEndInstant', () => {
  it('adds the duration for a showtime that stays within the same day', () => {
    expect(showtimeEndInstant('2026-09-01', '10:00:00', '11:38:00')).toEqual(
      new Date('2026-09-01T11:38:00Z'),
    );
  });

  it('rolls over to the next day for a showtime that wraps past midnight', () => {
    // 23:00 start, 150-minute movie -> end_time stored as '01:30:00' on the
    // same show_date, but the real end instant is the next calendar day.
    expect(showtimeEndInstant('2026-09-01', '23:00:00', '01:30:00')).toEqual(
      new Date('2026-09-02T01:30:00Z'),
    );
  });
});
