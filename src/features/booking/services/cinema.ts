import { supabase } from '@/services/supabase/client';

// Types
import { Cinema } from '@/features/booking/schemas/cinema';

// Utils
import { keysToCamel } from '@/utils/convert';

export class CinemaService {
  private static instance: CinemaService;

  private constructor() {}

  static getInstance(): CinemaService {
    if (!CinemaService.instance) {
      CinemaService.instance = new CinemaService();
    }
    return CinemaService.instance;
  }

  async getCinemas(): Promise<Cinema[]> {
    const { data, error } = await supabase
      .from('cinemas')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return keysToCamel(data) as Cinema[];
  }

  async getCinemaById(id: string): Promise<Cinema> {
    const { data, error } = await supabase
      .from('cinemas')
      .select('*, cinema_halls(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return keysToCamel(data) as Cinema;
  }

  async getCinemasByCity(city: string): Promise<Cinema[]> {
    const { data, error } = await supabase
      .from('cinemas')
      .select('*')
      .eq('city', city)
      .eq('is_active', true);
    if (error) throw error;
    return keysToCamel(data) as Cinema[];
  }
}

export const cinemaService = CinemaService.getInstance();
