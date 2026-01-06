import { ROUTES } from '@/constants';
import { supabase } from '@/services/supabase/client';
import { renderHook } from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useDeepLinkHandler } from '../useDeepLinkHandler';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  addEventListener: jest.fn(),
  getInitialURL: jest.fn(),
  parse: jest.fn(),
}));

jest.mock('@/services/supabase/client', () => ({
  supabase: {
    auth: {
      setSession: jest.fn(),
    },
  },
}));

describe('useDeepLinkHandler', () => {
  const mockRouter = {
    replace: jest.fn(),
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (Linking.addEventListener as jest.Mock).mockReturnValue({
      remove: jest.fn(),
    });
  });

  it('should handle initial URL on cold start', async () => {
    const initialUrl =
      'deeplink://auth/callback#access_token=123&refresh_token=456';
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(initialUrl);
    (Linking.parse as jest.Mock).mockReturnValue({
      path: 'auth/callback',
      hostname: 'auth/callback',
    });
    (supabase.auth.setSession as jest.Mock).mockResolvedValue({ error: null });

    renderHook(() => useDeepLinkHandler());

    await Promise.resolve(); // Wait for promise to resolve

    expect(Linking.getInitialURL).toHaveBeenCalled();
    expect(supabase.auth.setSession).toHaveBeenCalledWith({
      access_token: '123',
      refresh_token: '456',
    });
  });

  describe('handleDeepLink', () => {
    let handleDeepLink: ({ url }: { url: string }) => Promise<void>;

    beforeEach(async () => {
      (Linking.addEventListener as jest.Mock).mockImplementation(
        (event, callback) => {
          handleDeepLink = callback;
          return { remove: jest.fn() };
        },
      );
    });

    it('should handle OAuth callback and set session', async () => {
      (Linking.parse as jest.Mock).mockReturnValue({
        path: 'auth/callback',
        hostname: 'auth/callback',
      });
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({
        error: null,
      });
      renderHook(() => useDeepLinkHandler());

      await handleDeepLink({
        url: 'deeplink://auth/callback#access_token=abc&refresh_token=def',
      });

      expect(supabase.auth.setSession).toHaveBeenCalledWith({
        access_token: 'abc',
        refresh_token: 'def',
      });
      expect(mockRouter.replace).toHaveBeenCalledWith(ROUTES.HOME);
    });

    it('should handle password reset link and navigate', async () => {
      (Linking.parse as jest.Mock).mockReturnValue({
        path: '(auth)/reset-password',
        hostname: '(auth)/reset-password',
      });

      renderHook(() => useDeepLinkHandler());
      await handleDeepLink({
        url: 'deeplink://(auth)/reset-password#access_token=xyz&refresh_token=uvw&type=recovery',
      });

      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: ROUTES.RESET_PASSWORD,
        params: {
          type: 'recovery',
          access_token: 'xyz',
          refresh_token: 'uvw',
        },
      });
    });

    it('should log error on OAuth error', async () => {
      (Linking.parse as jest.Mock).mockReturnValue({
        path: 'auth/callback',
        hostname: 'auth/callback',
      });
      renderHook(() => useDeepLinkHandler());
      await handleDeepLink({
        url: 'deeplink://auth/callback#error=some_error&error_description=Something went wrong',
      });
    });

    it('should log error on password reset error', async () => {
      (Linking.parse as jest.Mock).mockReturnValue({
        path: '(auth)/reset-password',
        hostname: '(auth)/reset-password',
      });
      renderHook(() => useDeepLinkHandler());
      await handleDeepLink({
        url: 'deeplink://(auth)/reset-password#error=some_error&error_description=Something went wrong',
      });
    });
  });
});
