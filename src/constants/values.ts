import { Size } from './enum';

export const BLUR_HASH = 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH';

export const VIDEO_SOURCE =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const HEADER_TITLE_MAP = {
  '/onboarding': '',
  '/signin': '',
  '/signup': 'Create New Your Account',
  '/confirm-account': 'Confirm New Account',
} as const;

export const MAIN_TITLE_MAP = {
  '/': 'Find Your Best Movie',
  '/wallet': 'My Wallet',
  '/my-ticket': 'My Ticket',
} as const;

export const TOAST_DURATION = 3000;
// Category tabs for filtering news by category
const CATEGORY_TABS = {
  ALL: {
    ID: 'all',
    LABEL: 'All',
  },
  ACTION: {
    ID: 'action',
    LABEL: 'Action',
  },
  DRAMA: {
    ID: 'drama',
    LABEL: 'Drama',
  },
  HOROR: {
    ID: 'horor',
    LABEL: 'Horor',
  },
} as const;

const MOVIE_TABS = {
  ABOUT_MOVIE: {
    ID: 'about_movie',
    LABEL: 'About Movie',
  },
  CHOOSE_SEAT: {
    ID: 'choose_seat',
    LABEL: 'Choose Seat',
  },
} as const;

export const IMAGE_SIZE_MAP = {
  [Size.SMALL]: 'w-21 h-30',
  [Size.MEDIUM]: 'w-30 h-43',
  [Size.LARGE]: 'w-40 h-56',
};

export const FILTER_CATEGORY_TABS = [
  { id: CATEGORY_TABS.ALL.ID, label: CATEGORY_TABS.ALL.LABEL },
  { id: CATEGORY_TABS.ACTION.ID, label: CATEGORY_TABS.ACTION.LABEL },
  { id: CATEGORY_TABS.DRAMA.ID, label: CATEGORY_TABS.DRAMA.LABEL },
  { id: CATEGORY_TABS.HOROR.ID, label: CATEGORY_TABS.HOROR.LABEL },
];

export const DETAIL_MOVIE_TABS = [
  { id: MOVIE_TABS.ABOUT_MOVIE.ID, label: MOVIE_TABS.ABOUT_MOVIE.LABEL },
  { id: MOVIE_TABS.CHOOSE_SEAT.ID, label: MOVIE_TABS.CHOOSE_SEAT.LABEL },
];

export const HEADER_HEIGHT = 108;
