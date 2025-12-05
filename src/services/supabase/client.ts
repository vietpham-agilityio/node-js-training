import { Database } from '@/types';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { secureStorage } from '../storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const secureStorageAdapter = {
  getItem: async (key: string) => {
    return await secureStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    await secureStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    await secureStorage.removeItem(key);
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
