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
   * Sets a value for a given key in the secure storage.
   * @param {string} key The key to store the value under.
   * @param {string} value The value to store.
   * @returns {Promise<void>} A promise that resolves when the value has been set.
   * @throws {Error} If there was an error setting the value.
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
      throw error;
    }
  }

  /**
   * Retrieves a value from the secure storage for a given key.
   * @param {string} key The key to retrieve the value for.
   * @returns {Promise<string | null>} A promise that resolves with the value for the given key if it exists,
   * or null if it does not exist or if there was an error retrieving it.
   * @throws {Error} If there was an error retrieving the value.
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  }

  /**
   * Removes a value from the secure storage for a given key.
   * @param {string} key The key to remove the value for.
   * @returns {Promise<void>} A promise that resolves when the value has been removed.
   * @throws {Error} If there was an error removing the value.
   */
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
      throw error;
    }
  }

  /**
   * Clears the secure storage of all values related to authentication.
   * @returns {Promise<void>} A promise that resolves when all authentication-related values have been removed.
   * @throws {Error} If there was an error removing the values.
   */
  async clear(): Promise<void> {
    try {
      // TODO: Move to constants
      const keys = ['access_token', 'refresh_token', 'user_session'];
      await Promise.all(keys.map(key => this.removeItem(key)));
    } catch (error) {
      console.error('SecureStore clear error:', error);
      throw error;
    }
  }
}

export const secureStorage = SecureStorageService.getInstance();
