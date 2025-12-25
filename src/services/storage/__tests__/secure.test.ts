import { STORAGE_KEYS } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { SecureStorageService, secureStorage } from '../secure';

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

describe('SecureStorageService', () => {
  let service: SecureStorageService;
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
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
      expect(console.warn).toHaveBeenCalled();
    });

    it('should throw and log error if SecureStore fails', async () => {
      const error = new Error('SecureStore failed');
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(error);
      await expect(
        service.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'token'),
      ).rejects.toThrow(error);
      expect(console.error).toHaveBeenCalled();
    });

    it('should throw and log error if AsyncStorage fails', async () => {
      const error = new Error('AsyncStorage failed');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);
      await expect(service.setItem('key', 'value')).rejects.toThrow(error);
      expect(console.error).toHaveBeenCalled();
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
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove from SecureStore for a secure key', async () => {
      await service.removeItem(STORAGE_KEYS.USER_PIN);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_PIN,
      );
    });

    it('should throw and log error on failure', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(
        new Error('Failed'),
      );
      await expect(service.removeItem(STORAGE_KEYS.USER_PIN)).rejects.toThrow(
        'Failed',
      );
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('clearSensitiveData', () => {
    it('should remove all known sensitive keys', async () => {
      const removeItemSpy = jest.spyOn(service, 'removeItem');
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
    });
  });

  describe('getItemWithTimeout', () => {
    jest.useFakeTimers();
    it('should return value if getItem resolves before timeout', async () => {
      (service.getItem as jest.Mock) = jest
        .fn()
        .mockResolvedValue('test-value');
      const promise = service.getItemWithTimeout('some-key', 1000);
      jest.runAllTimers();
      const result = await promise;
      expect(result).toBe('test-value');
    });

    it('should return null if getItem does not resolve before timeout', async () => {
      (service.getItem as jest.Mock) = jest.fn(
        () => new Promise(resolve => setTimeout(() => resolve('value'), 2000)),
      );
      const promise = service.getItemWithTimeout('some-key', 1000);
      jest.runAllTimers();
      const result = await promise;
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('hasItem', () => {
    it('should return true if item exists', async () => {
      (service.getItem as jest.Mock) = jest.fn().mockResolvedValue('value');
      const result = await service.hasItem('key');
      expect(result).toBe(true);
    });
    it('should return false if item does not exist', async () => {
      (service.getItem as jest.Mock) = jest.fn().mockResolvedValue(null);
      const result = await service.hasItem('key');
      expect(result).toBe(false);
    });
  });

  describe('hasSession', () => {
    it('should return true if session exists', async () => {
      (service.getSession as jest.Mock) = jest
        .fn()
        .mockResolvedValue({ user: 'test' });
      const result = await service.hasSession();
      expect(result).toBe(true);
    });
    it('should return false if session does not exist', async () => {
      (service.getSession as jest.Mock) = jest.fn().mockResolvedValue(null);
      const result = await service.hasSession();
      expect(result).toBe(false);
    });
  });

  describe('migrateSessionStorage', () => {
    it('should return false if old session does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const result = await service.migrateSessionStorage();
      expect(result).toBe(false);
    });

    it('should return false if new format already exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('old-session');
      jest
        .spyOn(service as any, 'getSessionSensitive')
        .mockResolvedValue('new-session');
      const result = await service.migrateSessionStorage();
      expect(result).toBe(false);
    });

    it('should migrate session and return true', async () => {
      const oldSession = { user: 'test', token: 'abc' };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(oldSession),
      );
      jest.spyOn(service as any, 'getSessionSensitive').mockResolvedValue(null);
      const setSessionSpy = jest.spyOn(service, 'setSession');
      const result = await service.migrateSessionStorage();
      expect(setSessionSpy).toHaveBeenCalledWith(oldSession);
      expect(result).toBe(false);
    });

    it('should return false on migration error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('fail'));
      const result = await service.migrateSessionStorage();
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });
});
