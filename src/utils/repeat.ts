import { Schedule, Cron, DateTime } from 'effect';

export const repeatsWithOneSecond = (time: number) =>
  Schedule.addDelay(Schedule.recurs(time), () => '1 second');

/**
 * Cron schedule configuration
 * Runs on the 27th day of January at 11:00 AM in Asia/Hong_Kong timezone
 */
export const cron = Cron.make({
  seconds: [0], // at 0 seconds
  minutes: [9], // at 0 minutes
  hours: [11], // at 11 hours
  days: [27], // on 27th day of the month
  months: [1], // on 1st month (January)
  weekdays: [], // any weekday
  tz: DateTime.zoneUnsafeMakeNamed('Asia/Hong_Kong'),
});
