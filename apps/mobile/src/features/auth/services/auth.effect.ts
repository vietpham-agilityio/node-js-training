import { makeRedirectUri } from 'expo-auth-session';
import { Effect } from 'effect';

import type { AuthUser, TokenPair } from '@movea/api-contract';

// Constants
import { ERROR_MESSAGES, ROUTES } from '@/constants';

// HTTP
import { apiRequest } from '@/services/api/client';

// Supabase — still backs the password-reset flow until the API grows one
import { supabase } from '@/services/supabase/client';

// Types
import {
  AuthSession,
  SignInData,
  SignUpData,
} from '@/features/auth/types/auth';
import { AuthenticationError } from '../error/auth';

// Token persistence
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from './token-storage';

const messageOf = (
  error: unknown,
  fallback: string = ERROR_MESSAGES.UNKNOWN_ERROR,
): string =>
  error instanceof Error && error.message ? error.message : fallback;

const toSession = (user: AuthUser, accessToken: string): AuthSession => ({
  user,
  accessToken,
});

export class AuthServiceEffect {
  private static instance: AuthServiceEffect;

  private constructor() {}

  static getInstance(): AuthServiceEffect {
    if (!AuthServiceEffect.instance) {
      AuthServiceEffect.instance = new AuthServiceEffect();
    }
    return AuthServiceEffect.instance;
  }

  /** `GET /auth/me` with an explicit token, so it works right after login. */
  private me(accessToken: string) {
    return Effect.tryPromise({
      try: () => apiRequest<AuthUser>('/auth/me', { auth: true, accessToken }),
      catch: error => AuthenticationError.sessionFailed(messageOf(error)),
    });
  }

  signUp({ email, password, firstName, lastName }: SignUpData) {
    const self = this;

    return Effect.gen(function* () {
      const tokens = yield* Effect.tryPromise({
        try: () =>
          apiRequest<TokenPair>('/auth/register', {
            method: 'POST',
            body: { email, password, firstName, lastName },
          }),
        catch: error => AuthenticationError.signUpFailed(messageOf(error)),
      });

      yield* Effect.promise(() => saveTokens(tokens));
      const user = yield* self.me(tokens.accessToken);

      return { user, session: toSession(user, tokens.accessToken) };
    });
  }

  signIn({ email, password }: SignInData) {
    const self = this;

    return Effect.gen(function* () {
      const tokens = yield* Effect.tryPromise({
        try: () =>
          apiRequest<TokenPair>('/auth/login', {
            method: 'POST',
            body: { email, password },
          }),
        catch: error => AuthenticationError.loginFailed(messageOf(error)),
      });

      yield* Effect.promise(() => saveTokens(tokens));
      const user = yield* self.me(tokens.accessToken);

      return { user, session: toSession(user, tokens.accessToken) };
    });
  }

  signOut() {
    return Effect.gen(function* () {
      const refreshToken = yield* Effect.promise(() => getRefreshToken());

      if (refreshToken) {
        // Best effort — a failed revoke must not block the local sign-out.
        yield* Effect.ignore(
          Effect.tryPromise({
            try: () =>
              apiRequest<void>('/auth/logout', {
                method: 'POST',
                body: { refreshToken },
              }),
            catch: error => AuthenticationError.signOutFailed(messageOf(error)),
          }),
        );
      }

      yield* Effect.promise(() => clearTokens());
    });
  }

  /**
   * Restore the session from storage. Missing tokens → `null`. A rejected access
   * token is refreshed once; if that fails the stale tokens are cleared and the
   * caller is treated as signed out.
   */
  getSession() {
    const self = this;

    return Effect.gen(function* () {
      const [accessToken, refreshToken] = yield* Effect.promise(() =>
        Promise.all([getAccessToken(), getRefreshToken()]),
      );

      if (!accessToken || !refreshToken) {
        return null;
      }

      const current = yield* Effect.either(self.me(accessToken));
      if (current._tag === 'Right') {
        return toSession(current.right, accessToken);
      }

      const refreshed = yield* Effect.either(self.refreshSession());
      if (refreshed._tag === 'Right') {
        return refreshed.right;
      }

      yield* Effect.promise(() => clearTokens());
      return null;
    });
  }

  refreshSession() {
    const self = this;

    return Effect.gen(function* () {
      const refreshToken = yield* Effect.promise(() => getRefreshToken());

      if (!refreshToken) {
        return yield* Effect.fail(
          AuthenticationError.sessionFailed(ERROR_MESSAGES.UNKNOWN_ERROR),
        );
      }

      const tokens = yield* Effect.tryPromise({
        try: () =>
          apiRequest<TokenPair>('/auth/refresh', {
            method: 'POST',
            body: { refreshToken },
          }),
        catch: error => AuthenticationError.sessionFailed(messageOf(error)),
      });

      yield* Effect.promise(() => saveTokens(tokens));
      const user = yield* self.me(tokens.accessToken);

      return toSession(user, tokens.accessToken);
    });
  }

  // ---------------------------------------------------------------------------
  // Password reset / change — still on Supabase.
  // TODO: migrate to PATCH /users/me/password once the API exposes reset email.
  // ---------------------------------------------------------------------------

  resetPassword(email: string) {
    return Effect.gen(function* () {
      const redirectUrl = yield* Effect.try({
        try: () =>
          makeRedirectUri({
            scheme: 'movieticketbooking',
            path: ROUTES.RESET_PASSWORD,
          }),
        catch: (error: unknown) =>
          AuthenticationError.updatePasswordFailed(messageOf(error)),
      });

      const result = yield* Effect.tryPromise({
        try: async () =>
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
          }),
        catch: (error: unknown) =>
          AuthenticationError.updatePasswordFailed(messageOf(error)),
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
          AuthenticationError.updatePasswordFailed(messageOf(error)),
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
   * Verify the user's current password by signing in with it.
   * Used by the change-password flow before allowing an update.
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
          AuthenticationError.currentPasswordIncorrect(messageOf(error)),
      });

      if (error) {
        return yield* Effect.fail(
          AuthenticationError.currentPasswordIncorrect(error.message),
        );
      }

      return true;
    });
  }
}

export const authServiceEffect = AuthServiceEffect.getInstance();
