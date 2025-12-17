import { Href } from 'expo-router';

export const ROUTES = {
  // Main routes
  MOVIE_DETAILS: (id: string): Href => `/(main)/movies/${id}`,
  CHECKOUT: '/(main)/checkout',
  CINEMA: '/(main)/cinema',
  TICKET_DETAILS: (id: string): Href => `/(main)/tickets/${id}`,
  SEATS: '/(main)/seats',
  CHECKOUT_SUCCESS: '/(main)/checkout-success',
  PURCHASE_SUCCESS: '/(main)/purchase-success',

  // Profile routes
  PROFILE: '/(main)/profile',
  PROFILE_EDIT: '/(main)/profile/edit',

  // Auth routes
  LOGIN: '/(auth)/signin',
  SIGNUP: '/(auth)/signup',
  ONBOARDING: '/(auth)/onboarding',
  FORGOT_PASSWORD: '/(auth)/forgot-password',
  CONFIRM_ACCOUNT: '/confirm-account',

  // Tab routes
  HOME: '/(main)/(tabs)',
  MY_TICKET: '/(main)/(tabs)/my-ticket',
  MY_WALLET: '/(main)/(tabs)/wallet',

  WELCOME: '/(main)/welcome',

  // Modal routes
  SEARCH: '/(main)/search',
} as const;
