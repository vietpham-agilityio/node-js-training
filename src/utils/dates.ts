import {
  Cinema,
  CinemaHall,
  CinemaWithShowtimes,
  Showtime,
} from '@/features/booking/types/cinema';

/**
 * Get the labels for the next 7 days of the week
 * @returns The labels for the next 7 days of the week
 */

export const getDayOfWeekLabels = () => {
  const result = [];
  const today = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = days[date.getDay()];
    const dayNumber = date.getDate();
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format

    result.push({
      id: dateString,
      label: `${dayName} ${dayNumber}`,
      date: dateString,
    });
  }

  return result;
};

/**
 * Get the minimum showtime (current time rounded up to next 30-minute interval)
 * Returns null if current time is past 23:00
 */
export const getMinimumShowtime = (): string | null => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Round up to the next 30-minute interval
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

  // If current time is already past 23:00, return null
  if (startHour > 23 || (startHour === 23 && startMinute > 0)) {
    return null;
  }

  return `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
};

/**
 * Filter showtimes based on time constraints:
 * - Showtimes must be >= current time (rounded up to next 30-minute interval)
 * - Showtimes must be <= 23:00
 * - Only applies if showDate is today
 */
export const filterShowtimesByTime = (
  showtimes: Showtime[],
  showDate: string,
): Showtime[] => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  // Only filter if the show date is today
  if (showDate !== today) {
    return showtimes;
  }

  const minimumTime = getMinimumShowtime();
  if (!minimumTime) {
    // If past 23:00, return empty array
    return [];
  }

  return showtimes.filter(showtime => {
    // Handle both HH:MM and HH:MM:SS formats
    const timeParts = showtime.showTime.split(':');
    const timeHours = Number(timeParts[0]);
    const timeMinutes = Number(timeParts[1] || 0);

    const [minHours, minMinutes] = minimumTime.split(':').map(Number);

    // Convert to minutes for comparison
    const timeInMinutes = timeHours * 60 + timeMinutes;
    const minInMinutes = minHours * 60 + minMinutes;
    const maxInMinutes = 23 * 60; // 23:00

    // Showtime must be >= minimum time and <= 23:00
    return timeInMinutes >= minInMinutes && timeInMinutes <= maxInMinutes;
  });
};

export const formatShowtimes = (
  showtimes: Showtime[],
  showDate: string,
): CinemaWithShowtimes[] => {
  const filteredShowtimes = filterShowtimesByTime(showtimes, showDate);

  // Create a Map to group showtimes by cinema ID
  // Map is used here because:
  // 1. It allows efficient lookup by cinema ID (O(1) complexity)
  // 2. It prevents duplicate cinema entries
  // 3. It maintains insertion order for consistent results
  // Key: cinema.id (string), Value: { cinema, cinemaHall, showtimes[] }
  const cinemaMap = new Map<
    string,
    { cinema: Cinema; cinemaHall: CinemaHall; showtimes: Showtime[] }
  >();

  filteredShowtimes.forEach(showtime => {
    if (!showtime.cinemaHall?.cinema || !showtime.cinemaHall) return;

    const cinema = showtime.cinemaHall.cinema;
    const cinemaHall = showtime.cinemaHall;

    // Check if this cinema already exists in the map
    // has() method: returns true if the key exists, false otherwise
    if (!cinemaMap.has(cinema.id)) {
      // If cinema doesn't exist, create a new entry
      // set() method: adds or updates a key-value pair in the map
      cinemaMap.set(cinema.id, {
        cinema,
        cinemaHall,
        showtimes: [],
      });
    }

    cinemaMap.get(cinema.id)!.showtimes.push(showtime);
  });

  // Convert map to array and sort showtimes by showTime
  return (
    Array.from(cinemaMap.values())
      .map(item => ({
        ...item,
        // Sort showtimes within each cinema by time (ascending)
        showtimes: item.showtimes.sort((a, b) =>
          a.showTime.localeCompare(b.showTime),
        ),
      }))
      // Sort cinemas alphabetically by name
      .sort((a, b) => a.cinema.name.localeCompare(b.cinema.name))
  );
};
