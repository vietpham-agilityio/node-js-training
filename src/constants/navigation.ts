import {
  HomeIcon,
  HomeOutlineIcon,
  TicketIcon,
  TicketOutlineIcon,
  WalletIcon,
  WalletOutlineIcon,
} from '@/icons';

export const SCREENS = {
  // Main screens
  MAIN: {
    LAYOUT: '(main)',
    WELCOME: 'welcome',
    MOVIES: 'movies/[id]',
    CHECKOUT: 'checkout',

    // Modal screens
    SEARCH: 'search',
    CINEMA: 'cinema',
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

export const NAVIGATION_BOTTOM_TABS = [
  {
    TITLE: TABS.HOME.TITLE,
    NAME: TABS.HOME.NAME,
    ICON: HomeIcon,
    ICON_INACTIVE: HomeOutlineIcon,
  },
  {
    title: TABS.WALLET.TITLE,
    NAME: TABS.WALLET.NAME,
    ICON: WalletIcon,
    ICON_INACTIVE: WalletOutlineIcon,
  },
  {
    title: TABS.MY_TICKET.TITLE,
    NAME: TABS.MY_TICKET.NAME,
    ICON: TicketIcon,
    ICON_INACTIVE: TicketOutlineIcon,
  },
];
