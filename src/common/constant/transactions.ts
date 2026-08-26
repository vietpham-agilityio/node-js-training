import { ShowtimeStatus } from '../../modules/showtimes/enums/showtime-status.enum';

// DDR-016: what a showtime may become, keyed by what it is now. cancelled
// returns to scheduled because ADR-010 promises an accidental removal can be
// undone; completed is the one terminal state.
export const ALLOWED_TRANSITIONS: Record<ShowtimeStatus, ShowtimeStatus[]> = {
  [ShowtimeStatus.SCHEDULED]: [
    ShowtimeStatus.ACTIVE,
    ShowtimeStatus.COMPLETED,
    ShowtimeStatus.CANCELLED,
  ],
  [ShowtimeStatus.ACTIVE]: [ShowtimeStatus.COMPLETED, ShowtimeStatus.CANCELLED],
  [ShowtimeStatus.COMPLETED]: [],
  [ShowtimeStatus.CANCELLED]: [ShowtimeStatus.SCHEDULED],
};
