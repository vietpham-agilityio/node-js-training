import { Schedule } from 'effect';

export const repeatsWithOneSecond = (time: number) =>
  Schedule.addDelay(Schedule.recurs(time), () => '1 second');
