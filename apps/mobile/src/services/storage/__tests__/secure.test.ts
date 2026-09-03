import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { SecureStorageService, secureStorage } from '../secure';

// Mock constants
jest.mock('@/constants', () => ({
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    AUTH_KEYS: 'auth_keys',
    AUTH_REFRESH_TOKEN: 'auth_refresh_token',
    USER_PIN: 'user_pin',
    BIOMETRIC_KEY: 'biometric_key',
    USER_SESSION: 'user_session',
  },
  SECURE_STORE_SIZE_LIMIT: 2048,
  SENSITIVE_SESSION_FIELDS: ['token', 'password', 'key', 'secret', 'auth'],
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

// Get the mocked constants
const { STORAGE_KEYS } = require('@/constants');

describe('SecureStorageService', () => {
  let service: SecureStorageService;
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mocks to their default implementations
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);

    service = SecureStorageService.getInstance();
    global.Blob = jest.fn(
      parts =>
        ({
          size: parts?.join('').length,
        }) as any,
    );
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should be a singleton', () => {
    const instance1 = SecureStorageService.getInstance();
    const instance2 = SecureStorageService.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(secureStorage);
  });

  describe('setItem', () => {
    it('should use SecureStore for a secure key', async () => {
      await service.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'my-token');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEYS.ACCESS_TOKEN,
        'my-token',
      );
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should use AsyncStorage for a non-secure key', async () => {
      await service.setItem('some_other_key', 'some-value');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'some_other_key',
        'some-value',
      );
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should fall back to AsyncStorage if value is too large for SecureStore', async () => {
      const largeValue = 'a'.repeat(3000);
      await service.setItem(STORAGE_KEYS.ACCESS_TOKEN, largeValue);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.ACCESS_TOKEN,
        largeValue,
      );
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should throw and log error if SecureStore fails', async () => {
      const error = new Error('SecureStore failed');
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(error);
      await expect(
        service.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'token'),
      ).rejects.toThrow(error);
    });

    it('should throw and log error if AsyncStorage fails', async () => {
      const error = new Error('AsyncStorage failed');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);
      await expect(service.setItem('key', 'value')).rejects.toThrow(error);
    });
  });

  describe('getItem', () => {
    it('should get from SecureStore for a secure key', async () => {
      await service.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
        STORAGE_KEYS.REFRESH_TOKEN,
      );
    });

    it('should get from AsyncStorage for a non-secure key', async () => {
      await service.getItem('some_other_key');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('some_other_key');
    });

    it('should return null and log on error', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('Failed'),
      );
      const result = await service.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove from SecureStore for a secure key', async () => {
      await service.removeItem(STORAGE_KEYS.USER_PIN);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_PIN,
      );
    });

    it('should remove from AsyncStorage for a non-secure key', async () => {
      await service.removeItem('some_other_key');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('some_other_key');
    });

    it('should throw and log error on failure', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(
        new Error('Failed'),
      );
      await expect(service.removeItem(STORAGE_KEYS.USER_PIN)).rejects.toThrow(
        'Failed',
      );
    });
  });

  describe('setSession', () => {
    it('should warn and return early if sessionData is null', async () => {
      await service.setSession(null);

      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should warn and return early if sessionData is undefined', async () => {
      await service.setSession(undefined);
    });

    it('should store sensitive data in SecureStore and non-sensitive in AsyncStorage', async () => {
      const sessionData = {
        access_token: 'secret-token', // sensitive: contains 'token'
        refresh_token: 'secret-refresh', // sensitive: contains 'token'
        userId: '123', // non-sensitive
        userName: 'John Doe', // non-sensitive
      };

      await service.setSession(sessionData);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        `${STORAGE_KEYS.USER_SESSION}_sensitive`,
        expect.stringContaining('access_token'),
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_SESSION,
        expect.stringContaining('userId'),
      );
    });

    it('should only store sensitive data if no non-sensitive data exists', async () => {
      const sessionData = {
        access_token: 'secret-token', // sensitive: contains 'token'
        refresh_token: 'secret-refresh', // sensitive: contains 'token'
      };

      await service.setSession(sessionData);

      expect(SecureStore.setItemAsync).toHaveBeenCalled();
      // AsyncStorage should not be called for non-sensitive session data
      const asyncCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const regularSessionCall = asyncCalls.find(
        call => call[0] === STORAGE_KEYS.USER_SESSION,
      );
      expect(regularSessionCall).toBeUndefined();
    });

    it('should only store non-sensitive data if no sensitive data exists', async () => {
      const sessionData = {
        userId: '123',
        userName: 'John Doe',
      };

      await service.setSession(sessionData);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_SESSION,
        JSON.stringify(sessionData),
      );
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should fall back to AsyncStorage if sensitive data is too large', async () => {
      const sessionData = {
        access_token: 'a'.repeat(3000), // sensitive but too large
        userId: '123',
      };

      await service.setSession(sessionData);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `${STORAGE_KEYS.USER_SESSION}_sensitive`,
        expect.any(String),
      );
    });

    it('should throw and log error on storage failure', async () => {
      const error = new Error('Storage failed');
      // Mock SecureStore to fail for this test
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(error);

      const sessionData = {
        access_token: 'token', // sensitive field
      };

      await expect(service.setSession(sessionData)).rejects.toThrow(error);
    });
  });

  describe('getSession', () => {
    it('should retrieve and merge sensitive and non-sensitive session data', async () => {
      const sensitiveData = { access_token: 'secret' };
      const nonSensitiveData = { userId: '123' };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify(sensitiveData),
      );
      (AsyncStorage.getItem as jest.Mock).mockImplementation(key => {
        if (key === STORAGE_KEYS.USER_SESSION) {
          return Promise.resolve(JSON.stringify(nonSensitiveData));
        }
        return Promise.resolve(null);
      });

      const result = await service.getSession();

      expect(result).toEqual({ ...nonSensitiveData, ...sensitiveData });
    });

    it('should return only sensitive data if non-sensitive does not exist', async () => {
      const sensitiveData = { access_token: 'secret' };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify(sensitiveData),
      );
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await service.getSession();

      expect(result).toEqual(sensitiveData);
    });

    it('should return only non-sensitive data if sensitive does not exist', async () => {
      const nonSensitiveData = { userId: '123' };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.getItem as jest.Mock).mockImplementation(key => {
        if (key === STORAGE_KEYS.USER_SESSION) {
          return Promise.resolve(JSON.stringify(nonSensitiveData));
        }
        return Promise.resolve(null);
      });

      const result = await service.getSession();

      expect(result).toEqual(nonSensitiveData);
    });

    it('should return null if both sensitive and non-sensitive are null', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await service.getSession();

      expect(result).toBeNull();
    });

    it('should handle error parsing sensitive data', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('invalid-json');
      (AsyncStorage.getItem as jest.Mock).mockImplementation(key => {
        if (key === STORAGE_KEYS.USER_SESSION) {
          return Promise.resolve(JSON.stringify({ userId: '123' }));
        }
        return Promise.resolve(null);
      });
    });

    it('should try AsyncStorage fallback if SecureStore returns null', async () => {
      const sensitiveData = { access_token: 'secret' };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.getItem as jest.Mock).mockImplementation(key => {
        if (key === `${STORAGE_KEYS.USER_SESSION}_sensitive`) {
          return Promise.resolve(JSON.stringify(sensitiveData));
        }
        if (key === STORAGE_KEYS.USER_SESSION) {
          return Promise.resolve(JSON.stringify({ userId: '123' }));
        }
        return Promise.resolve(null);
      });

      const result = await service.getSession();

      expect(result).toEqual({ userId: '123', ...sensitiveData });
    });

    it('should return null and log error on retrieval failure', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('Failed'),
      );

      const result = await service.getSession();

      expect(result).toBeNull();
    });

    it('should try AsyncStorage fallback if SecureStore returns null', async () => {
      const sensitiveData = { accessToken: 'secret' };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.getItem as jest.Mock).mockImplementation(key => {
        if (key === `${STORAGE_KEYS.USER_SESSION}_sensitive`) {
          return Promise.resolve(JSON.stringify(sensitiveData));
        }
        if (key === STORAGE_KEYS.USER_SESSION) {
          return Promise.resolve(JSON.stringify({ userId: '123' }));
        }
        return Promise.resolve(null);
      });

      const result = await service.getSession();

      expect(result).toEqual({ userId: '123', ...sensitiveData });
    });
  });

  describe('removeSession', () => {
    it('should remove both sensitive and non-sensitive session data', async () => {
      await service.removeSession();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        `${STORAGE_KEYS.USER_SESSION}_sensitive`,
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_SESSION,
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        `${STORAGE_KEYS.USER_SESSION}_sensitive`,
      );
    });
  });

  describe('clearSensitiveData', () => {
    it('should remove all known sensitive keys', async () => {
      const removeItemSpy = jest
        .spyOn(service, 'removeItem')
        .mockResolvedValue();
      await service.clearSensitiveData();
      const sensitiveKeys = [
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_PIN,
        STORAGE_KEYS.BIOMETRIC_KEY,
        STORAGE_KEYS.AUTH_KEYS,
        STORAGE_KEYS.AUTH_REFRESH_TOKEN,
        `${STORAGE_KEYS.USER_SESSION}_sensitive`,
      ];
      expect(removeItemSpy).toHaveBeenCalledTimes(sensitiveKeys.length);
      sensitiveKeys.forEach(key => {
        expect(removeItemSpy).toHaveBeenCalledWith(key);
      });
      removeItemSpy.mockRestore();
    });

    it('should throw and log error on failure', async () => {
      const error = new Error('Complete failure');
      // Make the entire Promise.all fail by making removeItem throw synchronously
      jest.spyOn(service, 'removeItem').mockImplementation(() => {
        throw error;
      });

      await expect(service.clearSensitiveData()).rejects.toThrow();
    });
  });

  describe('clear', () => {
    it('should throw and log error on failure', async () => {
      const error = new Error('Failed');
      jest.spyOn(service, 'removeSession').mockRejectedValue(error);

      await expect(service.clear()).rejects.toThrow(error);
    });
  });

  describe('getItemWithTimeout', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return value if getItem resolves before timeout', async () => {
      jest.spyOn(service, 'getItem').mockResolvedValue('test-value');

      const promise = service.getItemWithTimeout('some-key', 1000);
      jest.runAllTimers();
      const result = await promise;

      expect(result).toBe('test-value');
    });

    it('should return null and warn if timeout occurs', async () => {
      jest
        .spyOn(service, 'getItem')
        .mockImplementation(
          () =>
            new Promise(resolve => setTimeout(() => resolve('value'), 10000)),
        );

      const promise = service.getItemWithTimeout('some-key', 1000);
      jest.advanceTimersByTime(1000);
      const result = await promise;

      expect(result).toBeNull();
    });
  });

  describe('hasItem', () => {
    it('should return true if item exists', async () => {
      jest.spyOn(service, 'getItem').mockResolvedValue('value');
      const result = await service.hasItem('key');
      expect(result).toBe(true);
    });

    it('should return false if item does not exist', async () => {
      jest.spyOn(service, 'getItem').mockResolvedValue(null);
      const result = await service.hasItem('key');
      expect(result).toBe(false);
    });
  });

  describe('hasSession', () => {
    it('should return true if session exists', async () => {
      jest.spyOn(service, 'getSession').mockResolvedValue({ user: 'test' });
      const result = await service.hasSession();
      expect(result).toBe(true);
    });

    it('should return false if session does not exist', async () => {
      jest.spyOn(service, 'getSession').mockResolvedValue(null);
      const result = await service.hasSession();
      expect(result).toBe(false);
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage information with session', async () => {
      const sessionData = {
        access_token: 'secret', // sensitive: contains 'token'
        userId: '123',
      };

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        STORAGE_KEYS.USER_SESSION,
        'other_key',
      ]);
      jest.spyOn(service, 'getSession').mockResolvedValue(sessionData);

      const result = await service.getStorageInfo();

      expect(result.hasSession).toBe(true);
      expect(result.sessionFields).toBeDefined();
      expect(result.sessionFields?.sensitive).toContain('access_token');
      expect(result.sessionFields?.nonSensitive).toContain('userId');
    });

    it('should return storage information without session', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
      jest.spyOn(service, 'getSession').mockResolvedValue(null);

      const result = await service.getStorageInfo();

      expect(result.hasSession).toBe(false);
      expect(result.sessionFields).toBeNull();
    });

    it('should return default values on error', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValue(
        new Error('Failed'),
      );

      const result = await service.getStorageInfo();

      expect(result).toEqual({
        secureStoreKeys: [],
        asyncStorageKeys: [],
        hasSession: false,
        sessionFields: null,
      });
    });
  });

  describe('migrateSessionStorage', () => {
    it('should return false if old session does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const result = await service.migrateSessionStorage();
      expect(result).toBe(false);
    });

    it('should return false if new format already exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({ user: 'test' }),
      );
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('new-session');

      const result = await service.migrateSessionStorage();
      expect(result).toBe(false);
    });

    it('should migrate session and return true', async () => {
      const oldSession = { user: 'test', access_token: 'abc' }; // use access_token for sensitive field
      (AsyncStorage.getItem as jest.Mock).mockImplementation(key => {
        if (key === STORAGE_KEYS.USER_SESSION) {
          return Promise.resolve(JSON.stringify(oldSession));
        }
        return Promise.resolve(null);
      });
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const setSessionSpy = jest
        .spyOn(service, 'setSession')
        .mockResolvedValue();

      const result = await service.migrateSessionStorage();

      expect(setSessionSpy).toHaveBeenCalledWith(oldSession);
      expect(result).toBe(true);
      setSessionSpy.mockRestore();
    });

    it('should return false on migration error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('fail'));
      const result = await service.migrateSessionStorage();
      expect(result).toBe(false);
    });
  });
});
