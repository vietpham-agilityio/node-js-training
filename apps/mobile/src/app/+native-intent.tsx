import * as Linking from 'expo-linking';

// Constants
import { ROUTES } from '@/constants';

/**
 * Native Intent Handler
 * This file intercepts incoming deep link URLs before Expo Router processes them
 * Useful for rewriting URLs with fragments (#) to query parameters (?)
 *
 * @see https://docs.expo.dev/router/advanced/native-intent/
 */

interface RedirectSystemPathOptions {
  path: string;
  initial: boolean;
}

export function redirectSystemPath(options: RedirectSystemPathOptions): string {
  const { path } = options;

  // Ensure path is a string
  if (typeof path !== 'string') {
    return path;
  }

  // Parse the URL
  const parsed = Linking.parse(path);

  // Supabase sends tokens in URL fragments: #type=recovery&access_token=xxx&refresh_token=xxx
  // Convert to query params for easier handling in React
  if (
    parsed.path === '(auth)/reset-password' ||
    parsed.hostname === '(auth)/reset-password'
  ) {
    const [, fragment] = path.split('#');

    // Check if fragment exists
    if (!fragment) {
      return path;
    }
    const params = new URLSearchParams(fragment);
    const rewrittenPath = `${ROUTES.RESET_PASSWORD}?${params}`;

    return rewrittenPath;
  }

  return path;
}
