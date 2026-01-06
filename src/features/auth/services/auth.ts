import { supabase } from '@/services/supabase/client';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Type
import { SignInData, SignUpData } from '@/features/auth/types/auth';

// Constants
import { ROUTES } from '@/constants';

WebBrowser.maybeCompleteAuthSession();

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signUp(data: SignUpData) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName ? data.fullName : undefined,
        },
      },
    });

    if (error) throw error;
    return authData;
  }

  async signIn(data: SignInData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    return authData;
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

  async signInWithGoogle() {
    try {
      const redirectUrl = makeRedirectUri({
        scheme: 'movieticketbooking',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        throw error;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
      );

      if (result.type === 'success') {
        const { url } = result;

        // Check for errors in callback URL
        const oauthError = this.getOAuthError(url);
        if (oauthError) {
          throw new Error(oauthError);
        }

        // Parse tokens from URL
        const tokens = this.parseOAuthCallbackUrl(url);
        if (!tokens) {
          throw new Error(
            'Failed to parse authentication tokens from callback URL',
          );
        }

        // Set session with the tokens
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          });

        if (sessionError) {
          throw sessionError;
        }

        return sessionData;
      } else if (result.type === 'cancel') {
        throw new Error('Authentication was cancelled');
      } else {
        throw new Error('OAuth authentication failed');
      }
    } catch (error) {
      throw error;
    }
  }

  async signInWithFacebook() {
    try {
      const redirectUrl = makeRedirectUri({
        scheme: 'movieticketbooking',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        throw error;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
      );

      if (result.type === 'success') {
        const { url } = result;

        // Check for errors in callback URL
        const oauthError = this.getOAuthError(url);
        if (oauthError) {
          throw new Error(oauthError);
        }

        // Parse tokens from URL
        const tokens = this.parseOAuthCallbackUrl(url);
        if (!tokens) {
          throw new Error(
            'Failed to parse authentication tokens from callback URL',
          );
        }

        // Set session with the tokens
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          });

        if (sessionError) {
          throw sessionError;
        }

        return sessionData;
      } else if (result.type === 'cancel') {
        throw new Error('Authentication was cancelled');
      } else {
        throw new Error('OAuth authentication failed');
      }
    } catch (error) {
      throw error;
    }
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  async refreshSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();
    if (error) throw error;
    return session;
  }

  async resetPassword(email: string) {
    const redirectUrl = makeRedirectUri({
      scheme: 'movieticketbooking',
      path: ROUTES.RESET_PASSWORD,
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      throw error;
    }
  }

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }
  }

  /**
   * Verify user's current password by attempting to sign in
   * This is useful for password change flows that require current password verification
   * @param email - User's email
   * @param password - Current password to verify
   * @returns true if password is correct
   * @throws Error if password is incorrect
   */
  async verifyCurrentPassword(
    email: string,
    password: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error('Current password is incorrect');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = AuthService.getInstance();
