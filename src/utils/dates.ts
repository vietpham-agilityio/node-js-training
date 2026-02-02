import { Effect } from 'effect';

// Schemas
import {
  Cinema,
  CinemaHall,
  CinemaWithShowTimes,
  ShowTime,
} from '@/features/booking/schemas/cinema';

// Constants
import { DAY_COUNT, DAY_LABELS, MAX_MINUTES } from '@/constants/configs';

type DayOfWeekLabel = {
  id: string;
  label: string;
  dayNumber: string;
};

/**
 * Effect that returns labels for the next 5 days (id, label, dayNumber).
 */
export const getDayOfWeekLabelsEffect = () =>
  Effect.sync(() => {
    const today = new Date();
    const result: DayOfWeekLabel[] = [];
    for (let i = 0; i < DAY_COUNT; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = DAY_LABELS[date.getDay()] ?? DAY_LABELS[0];
      const dayNumber = date.getDate();
      const dateString = date.toISOString().split('T')[0] ?? '';
      result.push({
        id: dateString,
        label: dayName,
        dayNumber: dayNumber.toString(),
      });
    }
    return result;
  });

/**
 * Get the labels for the next 5 days of the week.
 */
export const getDayOfWeekLabels = (): DayOfWeekLabel[] =>
  Effect.runSync(getDayOfWeekLabelsEffect());

/**
 * Effect that returns the minimum showtime (current time rounded up to next 30-minute interval).
 * Resolves to null if current time is past 23:00.
 */
export const getMinimumShowtimeEffect = (): Effect.Effect<string | null> =>
  Effect.flatMap(
    Effect.sync(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      let startHour = currentHour;
      let startMinute: number;

      if (currentMinute === 0) {
        startMinute = 0;
      } else if (currentMinute <= 30) {
        startMinute = 30;
      } else {
        startHour = currentHour + 1;
        startMinute = 0;
      }
      return { startHour, startMinute };
    }),
    ({ startHour, startMinute }) =>
      Effect.if(startHour > 23 || (startHour === 23 && startMinute > 0), {
        onTrue: () => Effect.succeed(null),
        onFalse: () =>
          Effect.succeed(
            `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
          ),
      }),
  );

/**
 * Get the minimum showtime (current time rounded up to next 30-minute interval).
 * Returns null if current time is past 23:00.
 */
export const getMinimumShowtime = (): string | null =>
  Effect.runSync(getMinimumShowtimeEffect());

const isShowtimeInRange = (showTime: string, minTime: string): boolean => {
  const [h, m] = showTime.split(':').map(Number);
  const [minH, minM] = minTime.split(':').map(Number);
  const timeInMinutes = (h || 0) * 60 + (m || 0);
  const minInMinutes = (minH || 0) * 60 + (minM || 0);
  return timeInMinutes >= minInMinutes && timeInMinutes <= MAX_MINUTES;
};

/**
 * Effect that filters showTimes by time:
 * - ShowTimes must be >= current time (rounded up to next 30-minute interval)
 * - ShowTimes must be <= 23:00
 * - Only applies if showDate is today
 */
export const filterShowTimesByTimeEffect = (
  showTimes: ShowTime[],
  showDate: string,
): Effect.Effect<ShowTime[]> =>
  Effect.flatMap(
    Effect.sync(() => new Date().toISOString().split('T')[0] ?? ''),
    today =>
      Effect.if(showDate !== today, {
        onTrue: () => Effect.succeed(showTimes),
        onFalse: () =>
          Effect.flatMap(getMinimumShowtimeEffect(), minTime =>
            Effect.if(minTime === null, {
              onTrue: () => Effect.succeed([]),
              onFalse: () =>
                Effect.succeed(
                  showTimes.filter(s =>
                    isShowtimeInRange(s.showTime, minTime as string),
                  ),
                ),
            }),
          ),
      }),
  );

/**
 * Filter showTimes based on time constraints:
 * - ShowTimes must be >= current time (rounded up to next 30-minute interval)
 * - ShowTimes must be <= 23:00
 * - Only applies if showDate is today
 */
export const filterShowTimesByTime = (
  showTimes: ShowTime[],
  showDate: string,
): ShowTime[] =>
  Effect.runSync(filterShowTimesByTimeEffect(showTimes, showDate));

const groupShowTimesByCinema = (
  filteredShowTimes: ShowTime[],
): CinemaWithShowTimes[] => {
  const cinemaMap = new Map<
    string,
    { cinema: Cinema; cinemaHall: CinemaHall; showTimes: ShowTime[] }
  >();

  for (const showTime of filteredShowTimes) {
    if (!showTime.cinemaHall?.cinema || !showTime.cinemaHall) continue;

    const cinema = showTime.cinemaHall.cinema;
    const cinemaHall = showTime.cinemaHall;

    if (!cinemaMap.has(cinema.id)) {
      cinemaMap.set(cinema.id, { cinema, cinemaHall, showTimes: [] });
    }
    cinemaMap.get(cinema.id)!.showTimes.push(showTime);
  }

  return Array.from(cinemaMap.values())
    .map(item => ({
      ...item,
      showTimes: [...item.showTimes].sort((a, b) =>
        a.showTime.localeCompare(b.showTime),
      ),
    }))
    .sort((a, b) => a.cinema.name.localeCompare(b.cinema.name));
};

/**
 * Effect that filters showTimes by date/time then groups by cinema and sorts.
 */
export const formatShowTimesEffect = (
  showTimes: ShowTime[],
  showDate: string,
): Effect.Effect<CinemaWithShowTimes[]> =>
  Effect.flatMap(filterShowTimesByTimeEffect(showTimes, showDate), filtered =>
    Effect.succeed(groupShowTimesByCinema(filtered)),
  );

/**
 * Filter showTimes by time, then group by cinema and sort by time and name.
 */
export const formatShowTimes = (
  showTimes: ShowTime[],
  showDate: string,
): CinemaWithShowTimes[] =>
  Effect.runSync(formatShowTimesEffect(showTimes, showDate));
