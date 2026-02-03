import { secureStorage } from '@/services/storage/secure';
import { Database } from '@/types/database';
import { createClient } from '@supabase/supabase-js';
import { Redacted } from 'effect';
import 'react-native-url-polyfill/auto';

/** Sensitive Supabase config stored in Redacted; wipe with wipeSupabaseSecrets() when needed (e.g. logout). */
export const supabaseUrlRedacted = Redacted.make(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
);
export const supabaseAnonKeyRedacted = Redacted.make(
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
);

export const wipeSupabaseSecrets = (): void => {
  Redacted.unsafeWipe(supabaseUrlRedacted);
  Redacted.unsafeWipe(supabaseAnonKeyRedacted);
};

/**
 * Custom storage adapter for Supabase Auth
 * Handles session storage with smart splitting:
 * - Sensitive data (tokens) → SecureStore
 * - Non-sensitive data (user info) → AsyncStorage
 */
const secureStorageAdapter = {
  /**
   * Get item from storage
   * For session keys, retrieves and merges split data
   */
  getItem: async (key: string) => {
    // Handle session storage specially
    if (key.includes('auth.token') || key.includes('session')) {
      const session = await secureStorage.getSession();
      if (session) {
        return JSON.stringify(session);
      }
      return null;
    }

    // For other keys, use standard getItem
    return await secureStorage.getItem(key);
  },

  /**
   * Set item in storage
   * For session keys, automatically splits into sensitive/non-sensitive parts
   */
  setItem: async (key: string, value: string) => {
    try {
      // Handle session storage specially
      if (key.includes('auth.token') || key.includes('session')) {
        const sessionData = JSON.parse(value);
        await secureStorage.setSession(sessionData);
        return;
      }

      // For other keys, use standard setItem
      await secureStorage.setItem(key, value);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove item from storage
   * For session keys, removes both sensitive and non-sensitive parts
   */
  removeItem: async (key: string) => {
    try {
      // Handle session removal specially
      if (key.includes('auth.token') || key.includes('session')) {
        await secureStorage.removeSession();
        return;
      }

      // For other keys, use standard removeItem
      await secureStorage.removeItem(key);
    } catch (error) {
      throw error;
    }
  },
};

export const supabase = createClient<Database>(
  Redacted.value(supabaseUrlRedacted),
  Redacted.value(supabaseAnonKeyRedacted),
  {
    auth: {
      storage: secureStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
