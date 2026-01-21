/**
 * Tab constants for movie filtering and detail views
 */

import { BOOKING_STATUS } from '@/constants/status';

export const GENRE_TABS = {
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

/**
 * Internal constant for movie detail page tabs
 * Used to construct the DETAIL_MOVIE_TABS array
 */
const MOVIE_TABS = {
  ABOUT_MOVIE: {
    ID: 'about_movie',
    LABEL: 'About Movie',
  },
  REVIEW: {
    ID: 'review',
    LABEL: 'Review',
  },
} as const;

/**
 * Array of category tabs formatted for use in filter UI components
 * Contains all movie genres including "All" option
 * Used in category filter tabs/switchers
 */
export const FILTER_GENRE_TABS = [
  { id: GENRE_TABS.ALL.ID, label: GENRE_TABS.ALL.LABEL },
  { id: GENRE_TABS.ACTION.ID, label: GENRE_TABS.ACTION.LABEL },
  { id: GENRE_TABS.ADVENTURE.ID, label: GENRE_TABS.ADVENTURE.LABEL },
  { id: GENRE_TABS.ANIMATION.ID, label: GENRE_TABS.ANIMATION.LABEL },
  { id: GENRE_TABS.COMEDY.ID, label: GENRE_TABS.COMEDY.LABEL },
  { id: GENRE_TABS.CRIME.ID, label: GENRE_TABS.CRIME.LABEL },
  { id: GENRE_TABS.DOCUMENTARY.ID, label: GENRE_TABS.DOCUMENTARY.LABEL },
  { id: GENRE_TABS.DRAMA.ID, label: GENRE_TABS.DRAMA.LABEL },
  { id: GENRE_TABS.FAMILY.ID, label: GENRE_TABS.FAMILY.LABEL },
  { id: GENRE_TABS.FANTASY.ID, label: GENRE_TABS.FANTASY.LABEL },
  { id: GENRE_TABS.HISTORY.ID, label: GENRE_TABS.HISTORY.LABEL },
  { id: GENRE_TABS.HORROR.ID, label: GENRE_TABS.HORROR.LABEL },
  { id: GENRE_TABS.MUSIC.ID, label: GENRE_TABS.MUSIC.LABEL },
  { id: GENRE_TABS.MYSTERY.ID, label: GENRE_TABS.MYSTERY.LABEL },
  { id: GENRE_TABS.ROMANCE.ID, label: GENRE_TABS.ROMANCE.LABEL },
  { id: GENRE_TABS.SCI_FI.ID, label: GENRE_TABS.SCI_FI.LABEL },
  { id: GENRE_TABS.TV_MOVIE.ID, label: GENRE_TABS.TV_MOVIE.LABEL },
  { id: GENRE_TABS.THRILLER.ID, label: GENRE_TABS.THRILLER.LABEL },
  { id: GENRE_TABS.WAR.ID, label: GENRE_TABS.WAR.LABEL },
  { id: GENRE_TABS.WESTERN.ID, label: GENRE_TABS.WESTERN.LABEL },
];

/**
 * Array of tabs for movie detail pages
 * Used to switch between "About Movie" and "Review" sections
 * on individual movie detail screens
 */
export const DETAIL_MOVIE_TABS = [
  { id: MOVIE_TABS.ABOUT_MOVIE.ID, label: MOVIE_TABS.ABOUT_MOVIE.LABEL },
  { id: MOVIE_TABS.REVIEW.ID, label: MOVIE_TABS.REVIEW.LABEL },
];

/**
 * Array of tabs for ticket pages
 * Used to switch between "All", "Active", and "Expired" tabs
 * on individual ticket screens
 */
export const TICKET_TABS = [
  { id: 'all', label: 'All' },
  { id: BOOKING_STATUS.ACTIVE, label: 'Active' },
  { id: BOOKING_STATUS.EXPIRED, label: 'Expired' },
];

// NEW: Rating filter options
export const RATING_FILTERS = [
  { id: 'all', label: 'All Ratings', minRating: 0 },
  { id: '4+', label: '4+', minRating: 4 },
  { id: '3+', label: '3+', minRating: 3 },
  { id: '2+', label: '2+', minRating: 2 },
  { id: '1+', label: '1+', minRating: 1 },
];
