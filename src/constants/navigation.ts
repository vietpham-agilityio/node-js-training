export const SCREENS = {
  // Main screens
  MAIN: {
    LAYOUT: '(main)',
    WELCOME: 'welcome',
    MOVIES: 'movies/[id]',
    CHECKOUT: 'checkout',

    // Modal screens
    SEARCH: 'search',
  },

  // Auth screens
  AUTH: {
    LAYOUT: '(auth)',
    SIGNIN: 'signin',
    SIGNUP: 'signup',
    ONBOARDING: 'onboarding',
    FORGOT_PASSWORD: 'forgot-password',
  },

  // Tab screens
  TABS: {
    LAYOUT: '(tabs)',
    HOME: 'index',
  },

  STORYBOOK: '(storybook)/index',
} as const;

export const TABS = {
  HOME: {
    NAME: 'index',
    TITLE: 'Movies',
  },
  WALLET: {
    NAME: 'wallet',
    TITLE: 'Wallet',
  },
  MY_TICKET: {
    NAME: 'my-ticket',
    TITLE: 'My Ticket',
  },
} as const;
