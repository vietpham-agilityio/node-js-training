export const BLUR_HASH = 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH';

export const HEADER_TITLE_MAP = {
  '/onboarding': '',
  '/signin': '',
  '/signup': 'Create New Your Account',
  '/confirm-account': 'Confirm New Account',
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

export const FILTER_CATEGORY_TABS = [
  { id: CATEGORY_TABS.ALL.ID, label: CATEGORY_TABS.ALL.LABEL },
  { id: CATEGORY_TABS.ACTION.ID, label: CATEGORY_TABS.ACTION.LABEL },
  { id: CATEGORY_TABS.DRAMA.ID, label: CATEGORY_TABS.DRAMA.LABEL },
  { id: CATEGORY_TABS.HOROR.ID, label: CATEGORY_TABS.HOROR.LABEL },
];

export const FILTER_MOVIE_TABS = [
  { id: MOVIE_TABS.ABOUT_MOVIE.ID, label: MOVIE_TABS.ABOUT_MOVIE.LABEL },
  { id: MOVIE_TABS.CHOOSE_SEAT.ID, label: MOVIE_TABS.CHOOSE_SEAT.LABEL },
];
