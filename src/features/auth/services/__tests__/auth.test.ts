import { AuthService, authService } from '../auth';
import { supabase } from '@/services/supabase/client';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { ROUTES } from '@/constants';

// Mocking supabase client
jest.mock('@/services/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      refreshSession: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      setSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

// Mocking expo-web-browser
jest.mock('expo-web-browser');

// Mocking expo-auth-session
jest.mock('expo-auth-session');

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    service = AuthService.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = AuthService.getInstance();
    const instance2 = AuthService.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(authService);
  });

  // Test for signUp
  describe('signUp', () => {
    it('should sign up a user successfully', async () => {
      const signUpData = {
        email: 'test@example.com',
        password: 'password',
        fullName: 'Test User',
      };
      const expectedAuthData = { user: { id: '123' }, session: null };
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: expectedAuthData,
        error: null,
      });

      const result = await service.signUp(signUpData);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.fullName,
          },
        },
      });
      expect(result).toEqual(expectedAuthData);
    });

    it('should throw an error if sign up fails', async () => {
      const signUpData = { email: 'test@example.com', password: 'password' };
      const error = new Error('Sign up failed');
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.signUp(signUpData)).rejects.toThrow(error);
    });
  });

  // Test for signIn
  describe('signIn', () => {
    it('should sign in a user successfully', async () => {
      const signInData = { email: 'test@example.com', password: 'password' };
      const expectedAuthData = {
        user: { id: '123' },
        session: { access_token: 'abc' },
      };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: expectedAuthData,
        error: null,
      });

      const result = await service.signIn(signInData);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(signInData);
      expect(result).toEqual(expectedAuthData);
    });

    it('should throw an error if sign in fails', async () => {
      const signInData = { email: 'test@example.com', password: 'password' };
      const error = new Error('Sign in failed');
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.signIn(signInData)).rejects.toThrow(error);
    });
  });

  // Test for signOut
  describe('signOut', () => {
    it('should sign out a user successfully', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });
      await service.signOut();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw an error if sign out fails', async () => {
      const error = new Error('Sign out failed');
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error });
      await expect(service.signOut()).rejects.toThrow(error);
    });
  });

  // Test for getSession
  describe('getSession', () => {
    it('should get the current session successfully', async () => {
      const session = { access_token: 'abc' };
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session },
        error: null,
      });

      const result = await service.getSession();

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(result).toEqual(session);
    });

    it('should throw an error if getSession fails', async () => {
      const error = new Error('Get session failed');
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error,
      });

      await expect(service.getSession()).rejects.toThrow(error);
    });
  });

  // Test for refreshSession
  describe('refreshSession', () => {
    it('should refresh the session successfully', async () => {
      const session = { access_token: 'def' };
      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session },
        error: null,
      });

      const result = await service.refreshSession();
      expect(supabase.auth.refreshSession).toHaveBeenCalled();
      expect(result).toEqual(session);
    });

    it('should throw an error if refreshSession fails', async () => {
      const error = new Error('Refresh session failed');
      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error,
      });
      await expect(service.refreshSession()).rejects.toThrow(error);
    });
  });

  // Test for resetPassword
  describe('resetPassword', () => {
    beforeEach(() => {
      (makeRedirectUri as jest.Mock).mockReturnValue(
        `movieticketbooking://${ROUTES.RESET_PASSWORD}`,
      );
    });

    it('should reset password successfully', async () => {
      const email = 'test@example.com';
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: null,
      });

      await service.resetPassword(email);

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(email, {
        redirectTo: `movieticketbooking://${ROUTES.RESET_PASSWORD}`,
      });
    });

    it('should throw an error if reset password fails', async () => {
      const email = 'test@example.com';
      const error = new Error('Reset password failed');
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error,
      });

      await expect(service.resetPassword(email)).rejects.toThrow(error);
    });
  });

  // Test for updatePassword
  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const newPassword = 'newPassword123';
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        error: null,
      });

      await service.updatePassword(newPassword);

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: newPassword,
      });
    });

    it('should throw an error if update password fails', async () => {
      const newPassword = 'newPassword123';
      const error = new Error('Update password failed');
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error });

      await expect(service.updatePassword(newPassword)).rejects.toThrow(error);
    });
  });

  // Test for verifyCurrentPassword
  describe('verifyCurrentPassword', () => {
    const email = 'test@example.com';
    const password = 'currentPassword';

    it('should return true for correct password', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        error: null,
      });
      const result = await service.verifyCurrentPassword(email, password);
      expect(result).toBe(true);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password,
      });
    });

    it('should throw error for incorrect password', async () => {
      const error = new Error('Current password is incorrect');
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        error: new Error('invalid credentials'),
      });
      await expect(service.verifyCurrentPassword(email, password)).rejects.toThrow(
        error,
      );
    });
  });

  // Test for onAuthStateChange
  describe('onAuthStateChange', () => {
    it('should call supabase.auth.onAuthStateChange with the callback', () => {
      const callback = jest.fn();
      service.onAuthStateChange(callback);
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
    });
  });

  // Test for signInWithGoogle
  describe('signInWithGoogle', () => {
    const redirectUrl = 'movieticketbooking://auth/callback';
    const oAuthUrl = 'https://supabase.io/auth/v1/authorize?provider=google';
    const accessToken = 'test-access-token';
    const refreshToken = 'test-refresh-token';

    beforeEach(() => {
      (makeRedirectUri as jest.Mock).mockReturnValue(redirectUrl);
    });

    it('should sign in with Google successfully', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: oAuthUrl },
        error: null,
      });

      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: `${redirectUrl}#access_token=${accessToken}&refresh_token=${refreshToken}`,
      });

      const sessionData = { session: { access_token: accessToken } };
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({
        data: sessionData,
        error: null,
      });

      const result = await service.signInWithGoogle();

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });
      expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
        oAuthUrl,
        redirectUrl,
      );
      expect(supabase.auth.setSession).toHaveBeenCalledWith({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      expect(result).toEqual(sessionData);
    });

    it('should throw error if signInWithOAuth fails', async () => {
      const error = new Error('OAuth provider error');
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: null },
        error,
      });

      await expect(service.signInWithGoogle()).rejects.toThrow(error);
    });

    it('should throw error if user cancels auth session', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: oAuthUrl },
        error: null,
      });

      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'cancel',
      });

      await expect(service.signInWithGoogle()).rejects.toThrow(
        'Authentication was cancelled',
      );
    });

    it('should throw error if OAuth callback has an error', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: oAuthUrl },
        error: null,
      });

      const errorMessage = 'access_denied';
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: `${redirectUrl}?error_description=${errorMessage}`,
      });

      await expect(service.signInWithGoogle()).rejects.toThrow(errorMessage);
    });

    it('should throw error if tokens are not in callback URL', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: oAuthUrl },
        error: null,
      });

      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: redirectUrl,
      });

      await expect(service.signInWithGoogle()).rejects.toThrow(
        'Failed to parse authentication tokens from callback URL',
      );
    });

    it('should throw error if setSession fails', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: oAuthUrl },
        error: null,
      });

      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: `${redirectUrl}#access_token=${accessToken}&refresh_token=${refreshToken}`,
      });

      const sessionError = new Error('Failed to set session');
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({
        data: null,
        error: sessionError,
      });

      await expect(service.signInWithGoogle()).rejects.toThrow(sessionError);
    });
  });

  // Test for signInWithFacebook
  describe('signInWithFacebook', () => {
    const redirectUrl = 'movieticketbooking://auth/callback';
    const oAuthUrl = 'https://supabase.io/auth/v1/authorize?provider=facebook';
    const accessToken = 'fb-access-token';
    const refreshToken = 'fb-refresh-token';

    beforeEach(() => {
      (makeRedirectUri as jest.Mock).mockReturnValue(redirectUrl);
    });

    it('should sign in with Facebook successfully', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: oAuthUrl },
        error: null,
      });

      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: `${redirectUrl}#access_token=${accessToken}&refresh_token=${refreshToken}`,
      });

      const sessionData = { session: { access_token: accessToken } };
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({
        data: sessionData,
        error: null,
      });

      const result = await service.signInWithFacebook();

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });
      expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
        oAuthUrl,
        redirectUrl,
      );
      expect(supabase.auth.setSession).toHaveBeenCalledWith({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      expect(result).toEqual(sessionData);
    });

    it('should throw error if user cancels auth session', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: oAuthUrl },
        error: null,
      });

      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'cancel',
      });

      await expect(service.signInWithFacebook()).rejects.toThrow(
        'Authentication was cancelled',
      );
    });
  });
});
