export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_SESSION: 'user_session',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  AUTH_KEYS: 'supabase.auth.token',
  AUTH_REFRESH_TOKEN: 'supabase.auth.refresh_token',
  USER_PIN: 'user_pin',
  BIOMETRIC_KEY: 'biometric_key',
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

export const TAB_BAR_THEME = {
  BACKGROUND_COLOR: '#051138',
  ACTIVE_COLOR: '#fff',
  INACTIVE_COLOR: '#42476a',
  ACTIVE_BORDER_COLOR: '#1dc7f7',
  LABEL_STYLE: {
    fontSize: 12,
    fontWeight: '300',
    marginTop: 4,
  },
  ICON_SIZE: 24,
} as const;
