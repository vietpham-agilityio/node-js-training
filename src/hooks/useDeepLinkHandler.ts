import { ROUTES } from '@/constants';
import { supabase } from '@/services/supabase/client';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

/**
 * Hook to handle deep links for OAuth callbacks and password reset
 * Should be used in the root layout or main app component
 */
export const useDeepLinkHandler = () => {
  const router = useRouter();

  useEffect(() => {
    /**
     * Handle deep link URLs
     * @param url - The deep link URL to handle
     */
    const handleDeepLink = async ({ url }: { url: string }) => {
      try {
        // Parse the URL
        const parsed = Linking.parse(url);

        // Handle OAuth callback
        if (
          parsed.path === 'auth/callback' ||
          parsed.hostname === 'auth/callback'
        ) {
          const [, fragment] = url.split('#');

          if (!fragment) return;

          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const error = params.get('error');
          const errorDescription = params.get('error_description');

          if (error) {
            console.error('OAuth error:', errorDescription || error);
            // You might want to show an alert here
            return;
          }

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error('Session error:', sessionError);
              return;
            }

            // Navigate to home or wherever you want after successful login
            router.replace(ROUTES.HOME);
          }
        }
        // Handle password reset
        else if (
          parsed.path === '(auth)/reset-password' ||
          parsed.hostname === '(auth)/reset-password'
        ) {
          const [, fragment] = url.split('#');

          if (!fragment) return;

          const params = new URLSearchParams(fragment);
          const type = params.get('type');
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const error = params.get('error');
          const errorDescription = params.get('error_description');

          if (error) {
            console.error('Reset error:', errorDescription || error);
            return;
          }

          if (type === 'recovery' && accessToken && refreshToken) {
            router.push({
              pathname: ROUTES.RESET_PASSWORD,
              params: {
                type: 'recovery',
                access_token: accessToken,
                refresh_token: refreshToken,
              },
            });
          }
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    // App already running
    const sub = Linking.addEventListener('url', handleDeepLink);

    // Cold start
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    return () => sub.remove();
  }, [router]);
};
