export const ROUTES = {
  // Auth routes
  LOGIN: '/(auth)/signin',
  SIGNUP: '/(auth)/signup',
  ONBOARDING: '/(auth)/onboarding',
  FORGOT_PASSWORD: '/(auth)/forgot-password',

  // Tab routes
  HOME: '/(main)/(tabs)',

  WELCOME: '/(main)/welcome',
} as const;
