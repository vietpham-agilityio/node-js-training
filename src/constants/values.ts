import { Size } from './enum';

export const BLUR_HASH = 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH';

export const VIDEO_SOURCE =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const HEADER_TITLE_MAP = {
  '/onboarding': '',
  '/signin': '',
  '/signup': 'Create New Your Account',
  '/confirm-account': 'Confirm New Account',
  '/checkout': 'Checkout Movie',
} as const;

export const MAIN_TITLE_MAP = {
  '/': 'Find Your Best Movie',
  '/wallet': 'My Wallet',
  '/my-ticket': 'My Ticket',
} as const;

export const TOAST_DURATION = 3000;

// Category tabs for filtering news by category
export const CATEGORY_TABS = {
  ALL: { ID: 'all', LABEL: 'All' },
  ACTION: { ID: 'action', LABEL: 'Action' },
  ADVENTURE: { ID: 'adventure', LABEL: 'Adventure' },
  ANIMATION: { ID: 'animation', LABEL: 'Animation' },
  COMEDY: { ID: 'comedy', LABEL: 'Comedy' },
  CRIME: { ID: 'crime', LABEL: 'Crime' },
  DOCUMENTARY: { ID: 'documentary', LABEL: 'Documentary' },
  DRAMA: { ID: 'drama', LABEL: 'Drama' },
  FAMILY: { ID: 'family', LABEL: 'Family' },
  FANTASY: { ID: 'fantasy', LABEL: 'Fantasy' },
  HISTORY: { ID: 'history', LABEL: 'History' },
  HORROR: { ID: 'horror', LABEL: 'Horror' },
  MUSIC: { ID: 'music', LABEL: 'Music' },
  MYSTERY: { ID: 'mystery', LABEL: 'Mystery' },
  ROMANCE: { ID: 'romance', LABEL: 'Romance' },
  SCI_FI: { ID: 'science_fiction', LABEL: 'Science Fiction' },
  TV_MOVIE: { ID: 'tv_movie', LABEL: 'TV Movie' },
  THRILLER: { ID: 'thriller', LABEL: 'Thriller' },
  WAR: { ID: 'war', LABEL: 'War' },
  WESTERN: { ID: 'western', LABEL: 'Western' },
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
  { id: CATEGORY_TABS.ADVENTURE.ID, label: CATEGORY_TABS.ADVENTURE.LABEL },
  { id: CATEGORY_TABS.ANIMATION.ID, label: CATEGORY_TABS.ANIMATION.LABEL },
  { id: CATEGORY_TABS.COMEDY.ID, label: CATEGORY_TABS.COMEDY.LABEL },
  { id: CATEGORY_TABS.CRIME.ID, label: CATEGORY_TABS.CRIME.LABEL },
  { id: CATEGORY_TABS.DOCUMENTARY.ID, label: CATEGORY_TABS.DOCUMENTARY.LABEL },
  { id: CATEGORY_TABS.DRAMA.ID, label: CATEGORY_TABS.DRAMA.LABEL },
  { id: CATEGORY_TABS.FAMILY.ID, label: CATEGORY_TABS.FAMILY.LABEL },
  { id: CATEGORY_TABS.FANTASY.ID, label: CATEGORY_TABS.FANTASY.LABEL },
  { id: CATEGORY_TABS.HISTORY.ID, label: CATEGORY_TABS.HISTORY.LABEL },
  { id: CATEGORY_TABS.HORROR.ID, label: CATEGORY_TABS.HORROR.LABEL },
  { id: CATEGORY_TABS.MUSIC.ID, label: CATEGORY_TABS.MUSIC.LABEL },
  { id: CATEGORY_TABS.MYSTERY.ID, label: CATEGORY_TABS.MYSTERY.LABEL },
  { id: CATEGORY_TABS.ROMANCE.ID, label: CATEGORY_TABS.ROMANCE.LABEL },
  { id: CATEGORY_TABS.SCI_FI.ID, label: CATEGORY_TABS.SCI_FI.LABEL },
  { id: CATEGORY_TABS.TV_MOVIE.ID, label: CATEGORY_TABS.TV_MOVIE.LABEL },
  { id: CATEGORY_TABS.THRILLER.ID, label: CATEGORY_TABS.THRILLER.LABEL },
  { id: CATEGORY_TABS.WAR.ID, label: CATEGORY_TABS.WAR.LABEL },
  { id: CATEGORY_TABS.WESTERN.ID, label: CATEGORY_TABS.WESTERN.LABEL },
];

export const DETAIL_MOVIE_TABS = [
  { id: MOVIE_TABS.ABOUT_MOVIE.ID, label: MOVIE_TABS.ABOUT_MOVIE.LABEL },
  { id: MOVIE_TABS.CHOOSE_SEAT.ID, label: MOVIE_TABS.CHOOSE_SEAT.LABEL },
];

// Height + Spacing
export const TABS_HEADER_HEIGHT = 108;
export const TABS_FOOTER_HEIGHT = 104;
export const SCREEN_HEADER_HEIGHT = 62;
export const SCREEN_HEADER_HEIGHT_WITH_TITLE = 120;
