import { STORAGE_KEYS } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export class SecureStorageService {
  private static instance: SecureStorageService;

  private constructor() {}

  /**
   * Returns an instance of the SecureStorageService. If the instance does not exist yet,
   * a new instance will be created.
   * @returns {SecureStorageService} The instance of SecureStorageService.
   */
  static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  /**
   * Determines if a key should be stored in SecureStore (for sensitive data)
   * or AsyncStorage (for larger, less sensitive data).
   * @param {string} key The key to check.
   * @returns {boolean} True if the key should use SecureStore, false for AsyncStorage.
   */
  private isSecureKey(key: string): boolean {
    // Only store refresh tokens and other small sensitive data in SecureStore
    const secureKeys = [
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.AUTH_REFRESH_TOKEN,
      STORAGE_KEYS.USER_PIN,
      STORAGE_KEYS.BIOMETRIC_KEY,
    ];
    return secureKeys.some(secureKey => key.includes(secureKey));
  }

  /**
   * Sets a value for a given key in the appropriate storage.
   * Sensitive keys (like refresh_token) go to SecureStore.
   * Other keys go to AsyncStorage to avoid the 2048-byte limit.
   * @param {string} key The key to store the value under.
   * @param {string} value The value to store.
   * @returns {Promise<void>} A promise that resolves when the value has been set.
   * @throws {Error} If there was an error setting the value.
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isSecureKey(key)) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a value from the appropriate storage for a given key.
   * @param {string} key The key to retrieve the value for.
   * @returns {Promise<string | null>} A promise that resolves with the value for the given key if it exists,
   * or null if it does not exist or if there was an error retrieving it.
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isSecureKey(key)) {
        return await SecureStore.getItemAsync(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch {
      return null;
    }
  }

  /**
   * Removes a value from the appropriate storage for a given key.
   * @param {string} key The key to remove the value for.
   * @returns {Promise<void>} A promise that resolves when the value has been removed.
   * @throws {Error} If there was an error removing the value.
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (this.isSecureKey(key)) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clears the storage of all values related to authentication.
   * @returns {Promise<void>} A promise that resolves when all authentication-related values have been removed.
   * @throws {Error} If there was an error removing the values.
   */
  async clear(): Promise<void> {
    try {
      // Clear both SecureStore and AsyncStorage auth-related keys
      const keys = [
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_SESSION,
        STORAGE_KEYS.AUTH_KEYS,
        STORAGE_KEYS.AUTH_REFRESH_TOKEN,
      ];
      await Promise.all(keys.map(key => this.removeItem(key)));
    } catch (error) {
      throw error;
    }
  }
}

export const secureStorage = SecureStorageService.getInstance();
