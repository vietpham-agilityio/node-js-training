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

  beforeEach(() => {
    jest.clearAllMocks();
    service = SecureStorageService.getInstance();
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
      const largeValue = 'a'.repeat(3000); // Larger than limit
      // Mock Blob and its size property for the test environment
      global.Blob = jest.fn(parts => ({
        size: parts.join('').length,
      })) as any;

      await service.setItem(STORAGE_KEYS.ACCESS_TOKEN, largeValue);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.ACCESS_TOKEN,
        largeValue,
      );
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
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
  });

  describe('Session Management', () => {
    const session = {
      access_token: 'at',
      refresh_token: 'rt',
      user: { id: 'u1', email: 'test@test.com' },
    };
    const sensitivePart = {
      access_token: 'at',
      refresh_token: 'rt',
    };
    const nonSensitivePart = {
      user: { id: 'u1', email: 'test@test.com' },
    };

    it('should split and set session data correctly', async () => {
      global.Blob = jest.fn(parts => ({
        size: parts.join('').length,
      })) as any;
      await service.setSession(session);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        `${STORAGE_KEYS.USER_SESSION}_sensitive`,
        JSON.stringify(sensitivePart),
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_SESSION,
        JSON.stringify(nonSensitivePart),
      );
    });

    it('should get and merge session data correctly', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify(sensitivePart),
      );
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(nonSensitivePart),
      );

      const result = await service.getSession();
      expect(result).toEqual(session);
    });

    it('should remove all parts of the session', async () => {
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
});
