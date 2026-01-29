import { Effect } from 'effect';
import { supabase } from '@/services/supabase/client';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Type
import { SignInData, SignUpData } from '@/features/auth/types/auth';
import { AuthenticationError } from '../error/auth';
import { ROUTES } from '@/constants';

WebBrowser.maybeCompleteAuthSession();

export class AuthServiceEffect {
  private static instance: AuthServiceEffect;

  private constructor() {}

  static getInstance(): AuthServiceEffect {
    if (!AuthServiceEffect.instance) {
      AuthServiceEffect.instance = new AuthServiceEffect();
    }
    return AuthServiceEffect.instance;
  }

  signUp(data: SignUpData) {
    return Effect.gen(function* () {
      const { data: authData, error } = yield* Effect.tryPromise({
        try: async () =>
          await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                full_name: data.fullName ? data.fullName : undefined,
              },
            },
          }),
        catch: error =>
          AuthenticationError.signUpFailed(
            error instanceof Error ? error.message : '',
          ),
      });

      if (error) {
        return yield* Effect.fail(
          AuthenticationError.signUpFailed(error.message),
        );
      }

      return authData;
    });
  }

  signIn(data: SignInData) {
    return Effect.gen(function* () {
      const { data: authData, error } = yield* Effect.tryPromise({
        try: async () =>
          await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          }),
        catch: error =>
          AuthenticationError.loginFailed(
            error instanceof Error ? error.message : '', // Error in case of API failure
          ),
      });

      if (error) {
        return yield* Effect.fail(
          AuthenticationError.loginFailed(error.message), // Error when reponse is error
        );
      }

      return authData;
    });
  }

  /**
   * Parse OAuth callback URL and extract tokens
   * @param url - The callback URL from OAuth provider
   * @returns Object containing access_token and refresh_token or null
   */
  private parseOAuthCallbackUrl(url: string): {
    access_token: string;
    refresh_token: string;
  } | null {
    try {
      // OAuth tokens are in the hash fragment (#), not query string
      const hashFragment = url.split('#')[1];
      if (!hashFragment) {
        return null;
      }

      const params = new URLSearchParams(hashFragment);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken || !refreshToken) {
        return null;
      }

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if OAuth callback URL contains an error
   * @param url - The callback URL
   * @returns Error message if exists, null otherwise
   */
  private getOAuthError(url: string): string | null {
    try {
      // Check both query string and hash for errors
      const queryString = url.split('?')[1]?.split('#')[0];
      const hashFragment = url.split('#')[1];

      const checkParams = (paramsString: string | undefined) => {
        if (!paramsString) return null;
        const params = new URLSearchParams(paramsString);
        const error = params.get('error');
        const errorDescription = params.get('error_description');
        return errorDescription || error;
      };

      return checkParams(queryString) || checkParams(hashFragment);
    } catch {
      return null;
    }
  }

  signInWithGoogle() {
    const self = this;

    return Effect.gen(function* () {
      const redirectUrl = yield* Effect.try({
        try: () =>
          makeRedirectUri({
            scheme: 'movieticketbooking',
          }),
        catch: (error: unknown) =>
          AuthenticationError.oauthFailed(
            error instanceof Error
              ? error.message
              : 'Failed to create redirect URL',
          ),
      });

      const oauthData = yield* Effect.tryPromise({
        try: async () =>
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
              skipBrowserRedirect: true,
            },
          }),
        catch: (error: unknown) =>
          AuthenticationError.oauthFailed(
            error instanceof Error
              ? error.message
              : 'OAuth initialization failed',
          ),
      });

      if (oauthData.error) {
        return yield* Effect.fail(
          AuthenticationError.oauthFailed(oauthData.error.message),
        );
      }

      const result = yield* Effect.tryPromise({
        try: async () =>
          await WebBrowser.openAuthSessionAsync(
            oauthData.data.url,
            redirectUrl,
          ),
        catch: (error: unknown) =>
          AuthenticationError.oauthFailed(
            error instanceof Error ? error.message : 'Browser session failed',
          ),
      });

      if (result.type === 'cancel') {
        return yield* Effect.fail(
          AuthenticationError.oauthCancelled('Authentication was cancelled'),
        );
      }

      if (result.type !== 'success') {
        return yield* Effect.fail(
          AuthenticationError.oauthFailed('OAuth authentication failed'),
        );
      }

      const { url } = result;

      const oauthError = yield* Effect.try({
        try: () => self.getOAuthError(url),
        catch: error =>
          AuthenticationError.oauthFailed(
            error instanceof Error
              ? error.message
              : 'Failed to get OAuth error',
          ),
      });

      if (oauthError) {
        return yield* Effect.fail(AuthenticationError.oauthFailed(oauthError));
      }

      const tokens = yield* Effect.try({
        try: () => self.parseOAuthCallbackUrl(url),
        catch: error =>
          AuthenticationError.oauthFailed(
            error instanceof Error
              ? error.message
              : 'Failed to parse OAuth callback URL',
          ),
      });

      if (!tokens) {
        return yield* Effect.fail(
          AuthenticationError.oauthFailed(
            'Failed to parse authentication tokens from callback URL',
          ),
        );
      }

      const sessionResult = yield* Effect.tryPromise({
        try: async () =>
          await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          }),
        catch: (error: unknown) =>
          AuthenticationError.sessionFailed(
            error instanceof Error ? error.message : 'Failed to set session',
          ),
      });

      if (sessionResult.error) {
        return yield* Effect.fail(
          AuthenticationError.sessionFailed(sessionResult.error.message),
        );
      }

      return sessionResult.data;
    });
  }

  signInWithFacebook() {
    const self = this;

    return Effect.gen(function* () {
      const redirectUrl = yield* Effect.try({
        try: () =>
          makeRedirectUri({
            scheme: 'movieticketbooking',
          }),
        catch: (error: unknown) =>
          AuthenticationError.oauthFailed(
            error instanceof Error
              ? error.message
              : 'Failed to create redirect URL',
          ),
      });

      const oauthData = yield* Effect.tryPromise({
        try: async () =>
          await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
              redirectTo: redirectUrl,
              skipBrowserRedirect: true,
            },
          }),
        catch: (error: unknown) =>
          AuthenticationError.oauthFailed(
            error instanceof Error
              ? error.message
              : 'OAuth initialization failed',
          ),
      });

      if (oauthData.error) {
        return yield* Effect.fail(
          AuthenticationError.oauthFailed(oauthData.error.message),
        );
      }

      const result = yield* Effect.tryPromise({
        try: async () =>
          await WebBrowser.openAuthSessionAsync(
            oauthData.data.url,
            redirectUrl,
          ),
        catch: (error: unknown) =>
          AuthenticationError.oauthFailed(
            error instanceof Error ? error.message : 'Browser session failed',
          ),
      });

      if (result.type === 'cancel') {
        return yield* Effect.fail(
          AuthenticationError.oauthCancelled('Authentication was cancelled'),
        );
      }

      if (result.type !== 'success') {
        return yield* Effect.fail(
          AuthenticationError.oauthFailed('OAuth authentication failed'),
        );
      }

      const { url } = result;

      const oauthError = yield* Effect.try({
        try: () => self.getOAuthError(url),
        catch: error =>
          AuthenticationError.oauthFailed(
            error instanceof Error
              ? error.message
              : 'Failed to get OAuth error',
          ),
      });
      if (oauthError) {
        return yield* Effect.fail(AuthenticationError.oauthFailed(oauthError));
      }

      const tokens = yield* Effect.try({
        try: () => self.parseOAuthCallbackUrl(url),
        catch: error =>
          AuthenticationError.oauthFailed(
            error instanceof Error
              ? error.message
              : 'Failed to parse OAuth callback URL',
          ),
      });
      if (!tokens) {
        return yield* Effect.fail(
          AuthenticationError.oauthFailed(
            'Failed to parse authentication tokens from callback URL',
          ),
        );
      }

      const sessionResult = yield* Effect.tryPromise({
        try: async () =>
          await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          }),
        catch: (error: unknown) =>
          AuthenticationError.sessionFailed(
            error instanceof Error ? error.message : 'Failed to set session',
          ),
      });

      if (sessionResult.error) {
        return yield* Effect.fail(
          AuthenticationError.sessionFailed(sessionResult.error.message),
        );
      }

      return sessionResult.data;
    });
  }

  signOut() {
    return Effect.gen(function* () {
      const result = yield* Effect.tryPromise({
        try: async () => await supabase.auth.signOut(),
        catch: (error: unknown) =>
          AuthenticationError.signOutFailed(
            error instanceof Error ? error.message : 'Sign out failed',
          ),
      });

      if (result.error) {
        return yield* Effect.fail(
          AuthenticationError.signOutFailed(result.error.message),
        );
      }

      return result;
    });
  }

  getSession() {
    return Effect.gen(function* () {
      const {
        data: { session },
        error,
      } = yield* Effect.tryPromise({
        try: async () => await supabase.auth.getSession(),
        catch: (error: unknown) =>
          AuthenticationError.sessionFailed(
            error instanceof Error ? error.message : 'Failed to get session',
          ),
      });

      if (error) {
        return yield* Effect.fail(
          AuthenticationError.sessionFailed(error.message),
        );
      }

      return session;
    });
  }

  refreshSession() {
    return Effect.gen(function* () {
      const {
        data: { session },
        error,
      } = yield* Effect.tryPromise({
        try: async () => await supabase.auth.refreshSession(),
        catch: (error: unknown) =>
          AuthenticationError.sessionFailed(
            error instanceof Error ? error.message : '',
          ),
      });

      if (error) {
        return yield* Effect.fail(
          AuthenticationError.sessionFailed(error.message),
        );
      }
      return session;
    });
  }

  resetPassword(email: string) {
    return Effect.gen(function* () {
      const redirectUrl = yield* Effect.try({
        try: () =>
          makeRedirectUri({
            scheme: 'movieticketbooking',
            path: ROUTES.RESET_PASSWORD,
          }),
        catch: (error: unknown) =>
          AuthenticationError.updatePasswordFailed(
            error instanceof Error ? error.message : '',
          ),
      });

      const result = yield* Effect.tryPromise({
        try: async () =>
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
          }),
        catch: (error: unknown) =>
          AuthenticationError.updatePasswordFailed(
            error instanceof Error ? error.message : '',
          ),
      });

      if (result.error) {
        return yield* Effect.fail(
          AuthenticationError.updatePasswordFailed(result.error.message),
        );
      }
    });
  }

  updatePassword(newPassword: string) {
    return Effect.gen(function* () {
      const { error } = yield* Effect.tryPromise({
        try: async () =>
          await supabase.auth.updateUser({
            password: newPassword,
          }),
        catch: (error: unknown) =>
          AuthenticationError.updatePasswordFailed(
            error instanceof Error ? error.message : '',
          ),
      });

      if (error) {
        return yield* Effect.fail(
          AuthenticationError.updatePasswordFailed(error.message),
        );
      }

      return true;
    });
  }

  /**
   * Verify user's current password by attempting to sign in
   * This is useful for password change flows that require current password verification
   * @param email - User's email
   * @param password - Current password to verify
   * @returns true if password is correct
   * @throws Error if password is incorrect
   */
  verifyCurrentPassword(email: string, password: string) {
    return Effect.gen(function* () {
      const { error } = yield* Effect.tryPromise({
        try: async () =>
          await supabase.auth.signInWithPassword({
            email,
            password,
          }),
        catch: (error: unknown) =>
          AuthenticationError.currentPasswordIncorrect(
            error instanceof Error ? error.message : '',
          ),
      });

      if (error) {
        return yield* Effect.fail(
          AuthenticationError.currentPasswordIncorrect(error.message),
        );
      }

      return true;
    });
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authServiceEffect = AuthServiceEffect.getInstance();
