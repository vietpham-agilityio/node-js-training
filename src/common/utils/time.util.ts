// Showtimes store show_time and end_time as 'HH:mm:ss' strings, so every
// scheduling calculation is string arithmetic. These helpers are the one
// place that arithmetic lives — BR-28 depends on them agreeing with each
// other, in particular addMinutesToTimeString and durationBetweenTimeStrings
// being exact inverses across midnight.

const MINUTES_PER_DAY = 24 * 60;

/** 'HH:mm[:ss]' -> minutes since midnight. Seconds are ignored. */
export const minutesOfTimeString = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/** Pads 'HH:mm' out to 'HH:mm:ss'. Idempotent for input that already has seconds. */
export const normalizeTimeString = (time: string): string => {
  const [hours, minutes, seconds] = time.split(':');
  return `${hours}:${minutes}:${seconds ?? '00'}`;
};

// Adds minutes to a 'HH:mm:ss' string, wrapping past midnight if needed.
export const addMinutesToTimeString = (
  time: string,
  minutesToAdd: number,
): string => {
  // seconds defaults to 0: a two-part 'HH:mm' would otherwise render as
  // 'HH:mm:undefined', which CreateShowtimeDto can reach.
  const [hours, minutes, seconds = 0] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Minutes from start to end, undoing the midnight wrap addMinutesToTimeString
 * applies. '23:00:00' -> '01:30:00' is 150 minutes, not -1290. A start equal to
 * its end means a full day rather than zero, since a zero-length showtime
 * cannot exist (BR-02 forces duration_minutes > 0).
 */
export const durationBetweenTimeStrings = (
  start: string,
  end: string,
): number =>
  (minutesOfTimeString(end) - minutesOfTimeString(start) + MINUTES_PER_DAY) %
    MINUTES_PER_DAY || MINUTES_PER_DAY;
