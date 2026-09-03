import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Constants
import {
  SECURE_STORE_SIZE_LIMIT,
  SENSITIVE_SESSION_FIELDS,
  STORAGE_KEYS,
} from '@/constants';

// Helper to determine if a session field is sensitive
const isSessionFieldSensitive = (field: string): boolean => {
  return SENSITIVE_SESSION_FIELDS.some(sensitive =>
    field.toLowerCase().includes(sensitive.toLowerCase()),
  );
};

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
    // Store all sensitive authentication data in SecureStore
    const secureKeys = [
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.AUTH_KEYS,
      STORAGE_KEYS.AUTH_REFRESH_TOKEN,
      STORAGE_KEYS.USER_PIN,
      STORAGE_KEYS.BIOMETRIC_KEY,
    ];
    return secureKeys.some(secureKey => key.includes(secureKey));
  }

  /**
   * Check if value size exceeds SecureStore limit
   * @param {string} value The value to check
   * @returns {boolean} True if size is within limit
   */
  private isWithinSecureStoreLimit(value: string): boolean {
    const byteSize = new Blob([value]).size;
    return byteSize <= SECURE_STORE_SIZE_LIMIT;
  }

  /**
   * Split session data into sensitive and non-sensitive parts
   * @param {object} sessionData The session data object
   * @returns {object} Object with sensitive and nonSensitive parts
   */
  private splitSessionData(sessionData: any): {
    sensitive: Record<string, any>;
    nonSensitive: Record<string, any>;
  } {
    const sensitive: Record<string, any> = {};
    const nonSensitive: Record<string, any> = {};

    Object.entries(sessionData).forEach(([key, value]) => {
      if (isSessionFieldSensitive(key)) {
        sensitive[key] = value;
      } else {
        nonSensitive[key] = value;
      }
    });

    return { sensitive, nonSensitive };
  }

  /**
   * Merge sensitive and non-sensitive session data back together
   * @param {object} sensitive Sensitive session data
   * @param {object} nonSensitive Non-sensitive session data
   * @returns {object} Merged session data
   */
  private mergeSessionData(
    sensitive: Record<string, any> | null,
    nonSensitive: Record<string, any> | null,
  ): any {
    if (!sensitive && !nonSensitive) return null;
    return { ...nonSensitive, ...sensitive };
  }

  /**
   * Sets a value for a given key in the appropriate storage.
   * Sensitive keys (like tokens) go to SecureStore if within size limit.
   * Large values automatically fallback to AsyncStorage with warning.
   * @param {string} key The key to store the value under.
   * @param {string} value The value to store.
   * @returns {Promise<void>} A promise that resolves when the value has been set.
   * @throws {Error} If there was an error setting the value.
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isSecureKey(key)) {
        if (!this.isWithinSecureStoreLimit(value)) {
          await AsyncStorage.setItem(key, value);
        } else {
          await SecureStore.setItemAsync(key, value);
        }
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Store session data with smart splitting
   * Sensitive fields (tokens) → SecureStore
   * Non-sensitive fields (user info, metadata) → AsyncStorage
   * @param {object} sessionData The session data to store
   * @returns {Promise<void>}
   */
  async setSession(sessionData: any): Promise<void> {
    try {
      if (!sessionData) {
        return;
      }

      // Split session data
      const { sensitive, nonSensitive } = this.splitSessionData(sessionData);

      // Store sensitive parts in SecureStore
      if (Object.keys(sensitive).length > 0) {
        const sensitiveJson = JSON.stringify(sensitive);

        if (this.isWithinSecureStoreLimit(sensitiveJson)) {
          await SecureStore.setItemAsync(
            `${STORAGE_KEYS.USER_SESSION}_sensitive`,
            sensitiveJson,
          );
        } else {
          await AsyncStorage.setItem(
            `${STORAGE_KEYS.USER_SESSION}_sensitive`,
            sensitiveJson,
          );
        }
      }

      // Store non-sensitive parts in AsyncStorage
      if (Object.keys(nonSensitive).length > 0) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_SESSION,
          JSON.stringify(nonSensitive),
        );
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
   * Retrieve session data with automatic merging of sensitive and non-sensitive parts
   * @returns {Promise<object | null>} Complete session object or null
   */
  async getSession(): Promise<any> {
    try {
      // Get both parts
      const [sensitiveJson, nonSensitiveJson] = await Promise.all([
        this.getSessionSensitive(),
        this.getItem(STORAGE_KEYS.USER_SESSION),
      ]);

      let sensitive = null;
      let nonSensitive = null;

      // Parse sensitive data
      if (sensitiveJson) {
        try {
          sensitive = JSON.parse(sensitiveJson);
        } catch {
          return null;
        }
      }

      // Parse non-sensitive data
      if (nonSensitiveJson) {
        try {
          nonSensitive = JSON.parse(nonSensitiveJson);
        } catch {
          return null;
        }
      }

      // Merge and return
      const session = this.mergeSessionData(sensitive, nonSensitive);

      return session;
    } catch {
      return null;
    }
  }

  /**
   * Get sensitive session data from SecureStore (with fallback to AsyncStorage)
   * @returns {Promise<string | null>}
   */
  private async getSessionSensitive(): Promise<string | null> {
    try {
      // Try SecureStore first
      const fromSecureStore = await SecureStore.getItemAsync(
        `${STORAGE_KEYS.USER_SESSION}_sensitive`,
      );

      if (fromSecureStore) {
        return fromSecureStore;
      }

      // Fallback to AsyncStorage (in case it was too large)
      return await AsyncStorage.getItem(
        `${STORAGE_KEYS.USER_SESSION}_sensitive`,
      );
    } catch {
      return null;
    }
  }

  /**
   * Retrieves a value with timeout to prevent hanging
   * @param {string} key The key to retrieve
   * @param {number} timeout Timeout in milliseconds (default: 5000ms)
   * @returns {Promise<string | null>} The value or null
   */
  async getItemWithTimeout(
    key: string,
    timeout = 5000,
  ): Promise<string | null> {
    return Promise.race([
      this.getItem(key),
      new Promise<null>(resolve =>
        setTimeout(() => {
          resolve(null);
        }, timeout),
      ),
    ]);
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
   * Remove session data (both sensitive and non-sensitive parts)
   * @returns {Promise<void>}
   */
  async removeSession(): Promise<void> {
    try {
      await Promise.all([
        // Remove from SecureStore
        SecureStore.deleteItemAsync(`${STORAGE_KEYS.USER_SESSION}_sensitive`),

        // Remove from AsyncStorage (both regular and fallback)
        AsyncStorage.removeItem(STORAGE_KEYS.USER_SESSION),
        AsyncStorage.removeItem(`${STORAGE_KEYS.USER_SESSION}_sensitive`),
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clears all sensitive authentication data from storage.
   * Use this when logging out or when user requests to clear data.
   * @returns {Promise<void>} A promise that resolves when all sensitive data has been removed.
   */
  async clearSensitiveData(): Promise<void> {
    try {
      const sensitiveKeys = [
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_PIN,
        STORAGE_KEYS.BIOMETRIC_KEY,
        STORAGE_KEYS.AUTH_KEYS,
        STORAGE_KEYS.AUTH_REFRESH_TOKEN,
        `${STORAGE_KEYS.USER_SESSION}_sensitive`,
      ];

      await Promise.all(sensitiveKeys.map(key => this.removeItem(key)));
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
      // Clear session first (handles both parts)
      await this.removeSession();

      // Clear other auth-related keys
      const keys = [
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.AUTH_KEYS,
        STORAGE_KEYS.AUTH_REFRESH_TOKEN,
      ];

      await Promise.all(keys.map(key => this.removeItem(key)));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if a key exists in storage
   * @param {string} key The key to check
   * @returns {Promise<boolean>} True if key exists
   */
  async hasItem(key: string): Promise<boolean> {
    const value = await this.getItem(key);
    return value !== null;
  }

  /**
   * Check if session exists
   * @returns {Promise<boolean>} True if session exists
   */
  async hasSession(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  /**
   * Get storage info for debugging
   * @returns {Promise<object>} Storage information
   */
  async getStorageInfo(): Promise<{
    secureStoreKeys: string[];
    asyncStorageKeys: string[];
    hasSession: boolean;
    sessionFields: {
      sensitive: string[];
      nonSensitive: string[];
    } | null;
  }> {
    try {
      const asyncKeys = await AsyncStorage.getAllKeys();
      const allKeys = Object.values(STORAGE_KEYS);

      const secureStoreKeys = allKeys.filter(key => this.isSecureKey(key));
      const asyncStorageKeys = asyncKeys.filter(
        key => allKeys.includes(key) && !this.isSecureKey(key),
      );

      // Check session
      const session = await this.getSession();
      let sessionFields = null;

      if (session) {
        const { sensitive, nonSensitive } = this.splitSessionData(session);
        sessionFields = {
          sensitive: Object.keys(sensitive),
          nonSensitive: Object.keys(nonSensitive),
        };
      }

      return {
        secureStoreKeys,
        asyncStorageKeys,
        hasSession: session !== null,
        sessionFields,
      };
    } catch {
      return {
        secureStoreKeys: [],
        asyncStorageKeys: [],
        hasSession: false,
        sessionFields: null,
      };
    }
  }

  /**
   * Migrate old session storage to new split format
   * Call this once during app upgrade to migrate existing data
   * @returns {Promise<boolean>} True if migration was needed and successful
   */
  async migrateSessionStorage(): Promise<boolean> {
    try {
      // Check if old format exists
      const oldSession = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);

      if (!oldSession) {
        return false;
      }

      // Check if new format already exists
      const newFormatExists = await this.getSessionSensitive();

      if (newFormatExists) {
        return false;
      }

      // Parse and migrate
      const sessionData = JSON.parse(oldSession);

      await this.setSession(sessionData);

      return true;
    } catch {
      return false;
    }
  }
}

export const secureStorage = SecureStorageService.getInstance();
