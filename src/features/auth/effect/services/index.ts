// Effect
import { Effect, Context } from 'effect';

// Supabase
import { AuthError, Session, User } from '@supabase/supabase-js';

// Error
import { AuthenticationError } from '../../error/auth';

// Types
import { SignInData, SignUpData } from '../../types/auth';

export class AuthService extends Context.Tag('AuthServiceTag')<
  AuthService,
  {
    readonly signUp: (data: SignUpData) => Effect.Effect<
      {
        user: User | null;
        session: Session | null;
      },
      AuthenticationError,
      never
    >;
    readonly signIn: (data: SignInData) => Effect.Effect<
      {
        user: User;
        session: Session;
      },
      AuthenticationError,
      never
    >;
    readonly singInWithGoogle: () => Effect.Effect<
      {
        user: User | null;
        session: Session | null;
      },
      AuthenticationError,
      never
    >;
    readonly singInWithFacebook: () => Effect.Effect<
      {
        user: User | null;
        session: Session | null;
      },
      AuthenticationError,
      never
    >;
    readonly signOut: () => Effect.Effect<void, AuthenticationError, never>;
    readonly getSession: () => Effect.Effect<
      Session | null,
      AuthenticationError,
      never
    >;
    readonly refreshSession: () => Effect.Effect<
      Session | null,
      AuthenticationError,
      never
    >;
    readonly resetPassword: (
      email: string,
    ) => Effect.Effect<void, AuthenticationError, never>;
    readonly verifyCurrentPassword: (
      email: string,
      password: string,
    ) => Effect.Effect<boolean, AuthenticationError, never>;
    readonly updatePassword: (
      newPassword: string,
    ) => Effect.Effect<void, AuthenticationError, never>;
    readonly onAuthStateChange: (
      callback: (event: string, session: Session) => void,
    ) => Effect.Effect<void, AuthenticationError, never>;
  }
>() {}
