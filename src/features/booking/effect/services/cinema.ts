// Effect
import { Effect, Context } from 'effect';

// Schema
import { CinemaError } from '../../error/cinema';

export class CinemaService extends Context.Tag('CinemaServiceTag')<
  CinemaService,
  {
    readonly getCinemas: () => Effect.Effect<
      {
        readonly id: string;
        readonly name: string;
        readonly address: string;
        readonly city: string;
        readonly facilities?: readonly string[] | undefined;
        readonly location: string;
        readonly phoneNumber?: string | undefined;
        readonly isActive: boolean;
        readonly createdAt: string;
        readonly updatedAt: string;
      }[],
      CinemaError,
      never
    >;

    readonly getCinemaById: (id: string) => Effect.Effect<
      {
        readonly id: string;
        readonly name: string;
        readonly address: string;
        readonly city: string;
        readonly facilities?: readonly string[] | undefined;
        readonly location: string;
        readonly phoneNumber?: string | undefined;
        readonly isActive: boolean;
        readonly createdAt: string;
        readonly updatedAt: string;
      },
      CinemaError,
      never
    >;
    readonly getCinemasByCity: (city: string) => Effect.Effect<
      {
        readonly id: string;
        readonly name: string;
        readonly address: string;
        readonly city: string;
        readonly facilities?: readonly string[] | undefined;
        readonly location: string;
        readonly phoneNumber?: string | undefined;
        readonly isActive: boolean;
        readonly createdAt: string;
        readonly updatedAt: string;
      }[],
      CinemaError,
      never
    >;
  }
>() {}
