export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_SESSION: 'user_session',
  ONBOARDING_COMPLETED: 'onboarding_completed',
};

export const API_CONFIG = {
  SEAT_RESERVATION_TIMEOUT: 10 * 60 * 1000,
  TICKET_EXPIRY_TIME: 24 * 60 * 60 * 1000,
  QUERY_STALE_TIME: 5 * 60 * 1000,
  SEARCH_MOVIE_STALE_TIME: 2 * 60 * 1000,
  BOOKING_STALE_TIME: 1 * 60 * 1000,
};

export const PAGINATION = {
  PAGE_OFFSET: 0,
  PAGE_LIMIT: 10,
  PAGE_LIMIT_MAX: 20,
};
