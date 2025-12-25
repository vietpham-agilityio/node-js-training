import { createClient } from '@supabase/supabase-js';
import { secureStorage } from '@/services/storage/secure';

// Mock secureStorage
jest.mock('@/services/storage/secure', () => ({
  secureStorage: {
    getSession: jest.fn(),
    getItem: jest.fn(),
    setSession: jest.fn(),
    setItem: jest.fn(),
    removeSession: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// Mock supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('Supabase Client', () => {
  let secureStorageAdapter: any;
  const mockCreateClient = createClient as jest.Mock;

  beforeAll(() => {
    // Import the client file, which will call createClient
    require('../client');
    // The adapter is the storage option in the last call to createClient
    secureStorageAdapter = mockCreateClient.mock.calls[0][2].auth.storage;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('secureStorageAdapter.getItem', () => {
    it('should call secureStorage.getSession for auth tokens', async () => {
      const session = { user: 'test' };
      (secureStorage.getSession as jest.Mock).mockResolvedValue(session);

      const result = await secureStorageAdapter.getItem('some.key.auth.token');
      expect(secureStorage.getSession).toHaveBeenCalled();
      expect(result).toBe(JSON.stringify(session));
    });

    it('should call secureStorage.getSession for session keys', async () => {
      const session = { user: 'test' };
      (secureStorage.getSession as jest.Mock).mockResolvedValue(session);

      const result = await secureStorageAdapter.getItem('some.key.session');
      expect(secureStorage.getSession).toHaveBeenCalled();
      expect(result).toBe(JSON.stringify(session));
    });

    it('should return null when getSession returns null', async () => {
      (secureStorage.getSession as jest.Mock).mockResolvedValue(null);
      const result = await secureStorageAdapter.getItem('some.key.session');
      expect(result).toBeNull();
    });

    it('should call secureStorage.getItem for other keys', async () => {
      (secureStorage.getItem as jest.Mock).mockResolvedValue('some_value');
      const result = await secureStorageAdapter.getItem('other.key');
      expect(secureStorage.getItem).toHaveBeenCalledWith('other.key');
      expect(result).toBe('some_value');
    });
  });

  describe('secureStorageAdapter.setItem', () => {
    it('should call secureStorage.setSession for auth tokens', async () => {
      const session = { user: 'test' };
      await secureStorageAdapter.setItem(
        'some.key.auth.token',
        JSON.stringify(session),
      );
      expect(secureStorage.setSession).toHaveBeenCalledWith(session);
    });

    it('should call secureStorage.setSession for session keys', async () => {
      const session = { user: 'test' };
      await secureStorageAdapter.setItem(
        'some.key.session',
        JSON.stringify(session),
      );
      expect(secureStorage.setSession).toHaveBeenCalledWith(session);
    });

    it('should call secureStorage.setItem for other keys', async () => {
      await secureStorageAdapter.setItem('other.key', 'some_value');
      expect(secureStorage.setItem).toHaveBeenCalledWith(
        'other.key',
        'some_value',
      );
    });

    it('should throw error if setSession throws', async () => {
      const error = new Error('Set session failed');
      (secureStorage.setSession as jest.Mock).mockRejectedValue(error);
      const session = { user: 'test' };
      await expect(
        secureStorageAdapter.setItem(
          'some.key.session',
          JSON.stringify(session),
        ),
      ).rejects.toThrow('Set session failed');
    });
  });

  describe('secureStorageAdapter.removeItem', () => {
    it('should call secureStorage.removeSession for auth tokens', async () => {
      await secureStorageAdapter.removeItem('some.key.auth.token');
      expect(secureStorage.removeSession).toHaveBeenCalled();
    });

    it('should call secureStorage.removeSession for session keys', async () => {
      await secureStorageAdapter.removeItem('some.key.session');
      expect(secureStorage.removeSession).toHaveBeenCalled();
    });

    it('should call secureStorage.removeItem for other keys', async () => {
      await secureStorageAdapter.removeItem('other.key');
      expect(secureStorage.removeItem).toHaveBeenCalledWith('other.key');
    });

    it('should throw error if removeSession throws', async () => {
      const error = new Error('Remove session failed');
      (secureStorage.removeSession as jest.Mock).mockRejectedValue(error);
      await expect(
        secureStorageAdapter.removeItem('some.key.session'),
      ).rejects.toThrow('Remove session failed');
    });
  });
});
