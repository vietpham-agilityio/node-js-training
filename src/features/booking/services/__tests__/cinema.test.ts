import { CinemaServiceEffect, cinemaServiceEffect } from '../cinema';
import { supabase } from '@/services/supabase/client';
import { keysToCamel } from '@/utils/convert';
import { runEffectForQuery } from '@/utils/effect';

const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  then: jest.fn(),
};

jest.mock('@/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => mockQueryBuilder),
  },
}));

jest.unmock('@/utils/convert');

describe('CinemaService', () => {
  let service: CinemaServiceEffect;
  const from = supabase.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = CinemaServiceEffect.getInstance();
    // Default `then` for awaited queries
    (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
      resolve({ data: [], error: null }),
    );
    (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });
  });

  it('should be a singleton', () => {
    const instance1 = CinemaServiceEffect.getInstance();
    const instance2 = CinemaServiceEffect.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(cinemaServiceEffect);
  });

  describe('getCinemas', () => {
    it('should return a list of active cinemas', async () => {
      const mockData = [{ id: 'cinema1', name: 'Cinema One' }];
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: mockData, error: null }),
      );

      const cinemas = await runEffectForQuery(cinemaServiceEffect.getCinemas());

      expect(from).toHaveBeenCalledWith('cinemas');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('is_active', true);
      expect(cinemas).toEqual(keysToCamel(mockData));
    });

    it('should throw an error if fetching fails', async () => {
      const error = new Error('Fetch failed');
      (mockQueryBuilder.then as jest.Mock).mockImplementation(
        (_resolve, reject) => reject(error),
      );

      await expect(
        runEffectForQuery(cinemaServiceEffect.getCinemas()),
      ).rejects.toThrow(error);
    });
  });

  describe('getCinemaById', () => {
    it('should return a single cinema by id', async () => {
      const mockCinema = { id: 'cinema1', name: 'Cinema One' };
      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockCinema,
        error: null,
      });

      const cinema = await runEffectForQuery(
        cinemaServiceEffect.getCinemaById('cinema1'),
      );

      expect(from).toHaveBeenCalledWith('cinemas');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        '*, cinema_halls(*)',
      );
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'cinema1');
      expect(mockQueryBuilder.single).toHaveBeenCalled();
      expect(cinema).toEqual(keysToCamel(mockCinema));
    });
  });

  describe('getCinemasByCity', () => {
    it('should return cinemas in a specific city', async () => {
      const mockData = [{ id: 'cinema1', city: 'Test City' }];
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: mockData, error: null }),
      );

      const cinemas = await runEffectForQuery(
        cinemaServiceEffect.getCinemasByCity('Test City'),
      );

      expect(from).toHaveBeenCalledWith('cinemas');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('city', 'Test City');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('is_active', true);
      expect(cinemas).toEqual(keysToCamel(mockData));
    });
  });
});
