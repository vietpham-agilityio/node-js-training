export const formatDate = (date: Date): string =>
  date.toISOString().slice(0, 10);

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Adds minutes to a 'HH:mm:ss' string, wrapping past midnight if needed.
export const addMinutesToTimeString = (
  time: string,
  minutesToAdd: number,
): string => {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
