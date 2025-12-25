
import { PushTokenService, pushTokenService } from '../push-token';
import { supabase } from '../../supabase/client';
import { keysToCamel } from '@/utils/convert';

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
    (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
      resolve({ data: [], error: null }),
    );
    (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
      data: null,
      error: null,
    });
    (mockQueryBuilder.insert as jest.Mock).mockResolvedValue({ error: null });
  });

  it('should be a singleton', () => {
    const instance1 = PushTokenService.getInstance();
    const instance2 = PushTokenService.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(pushTokenService);
  });

  describe('savePushToken', () => {
    it('should insert a new token if it does not exist', async () => {
      await service.savePushToken('user1', 'token1', 'ios');

      expect(from).toHaveBeenCalledWith('push_tokens');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        user_id: 'user1',
        expo_push_token: 'token1',
        device_id: undefined,
        platform: 'ios',
        is_active: true,
      });
      expect(mockQueryBuilder.update).not.toHaveBeenCalled();
    });

    it('should update an existing token', async () => {
      const existingToken = { id: 'existing1' };
      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: existingToken,
        error: null,
      });

      await service.savePushToken('user1', 'token1', 'android');

      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        is_active: true,
        updated_at: expect.any(String),
      });
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', existingToken.id);
      expect(mockQueryBuilder.insert).not.toHaveBeenCalled();
    });
  });

  describe('getUserPushTokens', () => {
    it('should return active push tokens for a user', async () => {
      const mockTokens = [{ expo_push_token: 'token1' }];
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: mockTokens, error: null }),
      );

      const tokens = await service.getUserPushTokens('user1');

      expect(from).toHaveBeenCalledWith('push_tokens');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user1');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('is_active', true);
      expect(tokens).toEqual(keysToCamel(mockTokens));
    });
  });

  describe('deactivatePushToken', () => {
    it('should set a token to inactive', async () => {
      await service.deactivatePushToken('user1', 'token1');

      expect(from).toHaveBeenCalledWith('push_tokens');
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({ is_active: false });
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user1');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'expo_push_token',
        'token1',
      );
    });
  });

  describe('deletePushToken', () => {
    it('should delete a token from the database', async () => {
      (mockQueryBuilder.delete as jest.Mock).mockReturnThis();

      await service.deletePushToken('user1', 'token1');

      expect(from).toHaveBeenCalledWith('push_tokens');
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user1');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'expo_push_token',
        'token1',
      );
    });
  });
});
