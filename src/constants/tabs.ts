/**
 * Tab constants for movie filtering and detail views
 */

import { TicketStatus } from '@/types';

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
  { id: TicketStatus.ACTIVE, label: 'Active' },
  { id: TicketStatus.EXPIRED, label: 'Expired' },
];

// NEW: Rating filter options
export const RATING_FILTERS = [
  { id: 'all', label: 'All Ratings', minRating: 0 },
  { id: '4+', label: '4+', minRating: 4 },
  { id: '3+', label: '3+', minRating: 3 },
  { id: '2+', label: '2+', minRating: 2 },
  { id: '1+', label: '1+', minRating: 1 },
];
