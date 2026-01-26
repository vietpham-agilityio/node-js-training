// Effect
import { Effect } from 'effect';

// Supabase
import { Session } from '@supabase/supabase-js';

// Types
import { SignInData, SignUpData } from '../../types/auth';

// Services
import { authServiceEffect } from '../../services/auth.effect';

export class AuthService extends Effect.Service<AuthService>()(
  'AuthServiceTag',
  {
    effect: Effect.gen(function* () {
      return {
        signUp: (data: SignUpData) =>
          Effect.map(authServiceEffect.signUp(data), authData => ({
            user: authData.user,
            session: authData.session,
          })),

        signIn: (data: SignInData) =>
          Effect.map(authServiceEffect.signIn(data), authData => ({
            user: authData.user,
            session: authData.session,
          })),

        singInWithGoogle: () =>
          Effect.map(authServiceEffect.signInWithGoogle(), authData => ({
            user: authData.user,
            session: authData.session,
          })),

        singInWithFacebook: () =>
          Effect.map(authServiceEffect.signInWithFacebook(), authData => ({
            user: authData.user,
            session: authData.session,
          })),

        signOut: () => authServiceEffect.signOut(),

        getSession: () => authServiceEffect.getSession(),

        refreshSession: () => authServiceEffect.refreshSession(),

        resetPassword: (email: string) =>
          authServiceEffect.resetPassword(email),

        verifyCurrentPassword: (email: string, password: string) =>
          authServiceEffect.verifyCurrentPassword(email, password),

        updatePassword: (newPassword: string) =>
          authServiceEffect.updatePassword(newPassword),

        onAuthStateChange: (
          callback: (event: string, session: Session) => void,
        ) =>
          Effect.sync(() => {
            authServiceEffect.onAuthStateChange(callback);
          }),
      } as const;
    }),
  },
) {}
