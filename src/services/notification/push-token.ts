import { PushToken } from '@/types/notification';
import { keysToCamel } from '@/utils';
import { supabase } from '../supabase/client';

export class PushTokenService {
  private static instance: PushTokenService;

  private constructor() {}

  static getInstance(): PushTokenService {
    if (!PushTokenService.instance) {
      PushTokenService.instance = new PushTokenService();
    }
    return PushTokenService.instance;
  }

  /**
   * Save push token to Supabase
   */
  async savePushToken(
    userId: string,
    expoPushToken: string,
    platform: 'ios' | 'android',
    deviceId?: string,
  ): Promise<void> {
    try {
      // Check if token already exists
      const { data: existingToken } = await supabase
        .from('push_tokens')
        .select('id')
        .eq('user_id', userId)
        .eq('expo_push_token', expoPushToken)
        .single();

      if (existingToken) {
        // Update existing token
        const { error } = await supabase
          .from('push_tokens')
          .update({
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingToken.id);

        if (error) throw error;
      } else {
        // Insert new token
        const { error } = await supabase.from('push_tokens').insert({
          user_id: userId,
          expo_push_token: expoPushToken,
          device_id: deviceId,
          platform,
          is_active: true,
        });

        if (error) throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active push tokens for user
   */
  async getUserPushTokens(userId: string): Promise<PushToken[]> {
    try {
      const { data, error } = await supabase
        .from('push_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;
      return keysToCamel(data || []) as PushToken[];
    } catch {
      return [];
    }
  }

  /**
   * Deactivate push token
   */
  async deactivatePushToken(
    userId: string,
    expoPushToken: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('expo_push_token', expoPushToken);

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete push token
   */
  async deletePushToken(userId: string, expoPushToken: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('expo_push_token', expoPushToken);

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  }
}

export const pushTokenService = PushTokenService.getInstance();
