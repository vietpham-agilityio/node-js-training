import { Href } from 'expo-router';

export const ROUTES = {
  // Main routes
  MOVIE_DETAILS: (id: string): Href => `/(main)/movies/${id}`,
  CHECKOUT: '/(main)/checkout',

  // Auth routes
  LOGIN: '/(auth)/signin',
  SIGNUP: '/(auth)/signup',
  ONBOARDING: '/(auth)/onboarding',
  FORGOT_PASSWORD: '/(auth)/forgot-password',
  CONFIRM_ACCOUNT: '/confirm-account',

  // Tab routes
  HOME: '/(main)/(tabs)',

  WELCOME: '/(main)/welcome',
} as const;
