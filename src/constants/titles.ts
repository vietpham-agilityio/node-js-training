/**
 * Header title mappings for navigation bar headers
 * Maps route paths to their corresponding header titles
 * Empty strings indicate that no header title should be displayed for that route
 */
export const HEADER_TITLE_MAP = {
  '/onboarding': '',
  '/signin': '',
  '/seats': '',
  '/signup': 'Create Your New Account',
  '/confirm-account': 'Confirm New Account',
  '/booking/checkout': 'Checkout Movie',
  '/tickets/': 'Ticket Details',
  '/profile/edit': 'Edit Your Profile',
  '/purchase/top-up': 'Top Up',
  '/profile/change-password': 'Change Password',
} as const;

/**
 * Main page title mappings for screen headings
 * Maps route paths to their corresponding main page titles
 * Used for displaying prominent titles on main content areas
 */
export const MAIN_TITLE_MAP = {
  '/': 'Find Your Best Movie',
  '/wallet': 'My Wallet',
  '/my-ticket': 'My Ticket',
} as const;
