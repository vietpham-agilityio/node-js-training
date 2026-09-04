/**
 * Tab constants for movie filtering and detail views
 */

import { BOOKING_STATUS } from '@/constants/status';

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
