export const ROUTES = {
  // Auth routes
  LOGIN: '/(auth)/signin',
  SIGNUP: '/(auth)/signup',
  ONBOARDING: '/(auth)/onboarding',
  FORGOT_PASSWORD: '/(auth)/forgot-password',
  CONFIRM_ACCOUNT: '/(auth)/confirm-account',

  // Tab routes
  HOME: '/(main)/(tabs)',
} as const;
