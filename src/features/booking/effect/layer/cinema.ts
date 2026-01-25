import { Effect, Layer } from 'effect';

// Services
import { cinemaServiceEffect } from '../../services/cinema';

// Effect
import { CinemaService } from '../services/cinema';

export const CinemaServiceLayer = Layer.effect(
  CinemaService,
  Effect.gen(function* () {
    return {
      getCinemas: () => cinemaServiceEffect.getCinemas(),

      getCinemaById: (id: string) => cinemaServiceEffect.getCinemaById(id),

      getCinemasByCity: (city: string) =>
        cinemaServiceEffect.getCinemasByCity(city),
    } as const;
  }),
);
