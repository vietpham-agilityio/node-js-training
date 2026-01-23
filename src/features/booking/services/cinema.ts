// Supabase
import { supabase } from '@/services/supabase/client';

// Effect
import { Effect } from 'effect';

// Types
import { Cinema } from '@/features/booking/schemas/cinema';

// Utils
import { keysToCamel } from '@/utils/convert';

// Error
import { CinemaError } from '@/features/booking/error/cinema';

export class CinemaServiceEffect {
  private static instance: CinemaServiceEffect;

  private constructor() {}

  static getInstance(): CinemaServiceEffect {
    if (!CinemaServiceEffect.instance) {
      CinemaServiceEffect.instance = new CinemaServiceEffect();
    }
    return CinemaServiceEffect.instance;
  }

  getCinemas = () =>
    Effect.tryPromise({
      try: async () => {
        const { data, error } = await supabase
          .from('cinemas')
          .select('*')
          .eq('is_active', true);

        if (error) throw CinemaError.cinemaNotFound(error.message);

        return keysToCamel(data) as Cinema[];
      },
      catch: (error: unknown) =>
        CinemaError.cinemaNotFound(error instanceof Error ? error.message : ''),
    });

  getCinemaById = (id: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data, error } = await supabase
          .from('cinemas')
          .select('*, cinema_halls(*)')
          .eq('id', id)
          .single();

        if (error) throw CinemaError.cinemaNotFound(error.message);

        return keysToCamel(data) as Cinema;
      },
      catch: (error: unknown) =>
        CinemaError.cinemaNotFound(error instanceof Error ? error.message : ''),
    });

  getCinemasByCity = (city: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data, error } = await supabase
          .from('cinemas')
          .select('*')
          .eq('city', city)
          .eq('is_active', true);

        if (error) throw CinemaError.cinemaNotFound(error.message);

        return keysToCamel(data) as Cinema[];
      },
      catch: (error: unknown) =>
        CinemaError.cinemaNotFound(error instanceof Error ? error.message : ''),
    });
}

export const cinemaServiceEffect = CinemaServiceEffect.getInstance();
