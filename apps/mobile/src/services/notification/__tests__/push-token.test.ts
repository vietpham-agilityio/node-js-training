import { keysToCamel } from '@/utils/convert';
import { supabase } from '../../supabase/client';
import { PushTokenService, pushTokenService } from '../push-token';

const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  then: jest.fn(),
};

jest.mock('../../supabase/client', () => ({
  supabase: {
    from: jest.fn(() => mockQueryBuilder),
  },
}));

jest.unmock('@/utils/convert');

describe('PushTokenService', () => {
  let service: PushTokenService;
  const from = supabase.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = PushTokenService.getInstance();
    // Reset mocks to a default success state
    (mockQueryBuilder.then as jest.Mock).mockImplementation(callback =>
      Promise.resolve(callback({ data: [], error: null })),
    );
    (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
      data: null,
      error: null,
    });
    // For insert, update, delete, we often check the error, so mock it as part of the returned object
    const mockMutationResult = { error: null };
    (mockQueryBuilder.insert as jest.Mock).mockResolvedValue(
      mockMutationResult,
    );
    (mockQueryBuilder.update as jest.Mock).mockResolvedValue(
      mockMutationResult,
    );
    (mockQueryBuilder.delete as jest.Mock).mockResolvedValue(
      mockMutationResult,
    );
  });

  it('should be a singleton', () => {
    const instance1 = PushTokenService.getInstance();
    const instance2 = PushTokenService.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(pushTokenService);
  });

  describe('savePushToken', () => {
    it('should insert a new token if it does not exist', async () => {
      await service.savePushToken('user1', 'token1', 'ios', 'device1');

      expect(from).toHaveBeenCalledWith('push_tokens');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        user_id: 'user1',
        expo_push_token: 'token1',
        device_id: 'device1',
        platform: 'ios',
        is_active: true,
      });
      expect(mockQueryBuilder.update).not.toHaveBeenCalled();
    });

    it('should throw error on select failure', async () => {
      const error = new Error('DB error');
      (mockQueryBuilder.single as jest.Mock).mockRejectedValue(error);
      await expect(
        service.savePushToken('user1', 'token1', 'ios'),
      ).rejects.toThrow(error);
    });

    it('should throw error on insert failure', async () => {
      const error = { message: 'Insert failed' };
      (mockQueryBuilder.insert as jest.Mock).mockResolvedValue({ error });
      await expect(
        service.savePushToken('user1', 'token1', 'ios'),
      ).rejects.toEqual(error);
    });
  });

  describe('getUserPushTokens', () => {
    it('should return active push tokens for a user', async () => {
      const mockTokens = [{ expo_push_token: 'token1' }];
      (mockQueryBuilder.then as jest.Mock).mockImplementation(callback =>
        Promise.resolve(callback({ data: mockTokens, error: null })),
      );

      const tokens = await service.getUserPushTokens('user1');

      expect(from).toHaveBeenCalledWith('push_tokens');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user1');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('is_active', true);
      expect(tokens).toEqual(keysToCamel(mockTokens));
    });

    it('should return empty array on exception', async () => {
      (from as jest.Mock).mockImplementation(() => {
        throw new Error('Connection error');
      });
      const tokens = await service.getUserPushTokens('user1');
      expect(tokens).toEqual([]);
    });
  });
});
