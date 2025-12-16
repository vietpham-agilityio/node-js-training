import { Showtime, ShowtimeStatus } from '@/types';

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
 * Generate showtimes starting from the current time, rounded up to the next 30-minute interval
 * Generates times in 30-minute intervals until 21:00 (9 PM)
 */
export const generateShowtimeTimes = (): string[] => {
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

  // If current time is already past 21:00, return empty array
  if (startHour > 21 || (startHour === 21 && startMinute > 0)) {
    return [];
  }

  const showtimes: string[] = [];
  let hour = startHour;
  let minute = startMinute;

  // Generate showtimes until 21:00
  while (hour < 21 || (hour === 21 && minute === 0)) {
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    showtimes.push(timeString);

    // Move to next 30-minute interval
    minute += 30;
    if (minute >= 60) {
      minute = 0;
      hour += 1;
    }
  }

  return showtimes;
};

/**
 * Helper function to calculate end time from show time
 * Assumes movie duration of 120 minutes (2 hours)
 */
const calculateEndTime = (showTime: string): string => {
  const [hours, minutes] = showTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + 120 * 60 * 1000); // Add 120 minutes
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Generate Showtime objects for a cinema
 */
export const generateShowtimesForCinema = (
  cinemaId: string,
  cinemaHallId: string,
  movieId: string,
  showDate: string,
  baseId: number,
): Showtime[] => {
  const now = new Date().toISOString();
  const showtimeTimes = generateShowtimeTimes();

  return showtimeTimes.map((showTime, index) => {
    const id = (baseId + index).toString();

    return {
      id,
      movieId,
      cinemaHallId,
      showDate,
      showTime,
      endTime: calculateEndTime(showTime),
      price: 50000, // Default price in IDR
      availableSeats: 100, // Default available seats
      status: ShowtimeStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };
  });
};
