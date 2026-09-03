import { supabase } from '@/services/supabase/client';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

// Types
import { UpdateProfileData, UserProfile } from '@/features/auth/types/auth';

// Utils
import { keysToCamel } from '@/utils/convert';
import { Effect } from 'effect';
import { SettingError } from '../error';
import { runEffectForQuery } from '@/utils/effect';

export class ProfileService {
  private static instance: ProfileService;

  private constructor() {}

  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  /**
   * Get user profile by user ID
   */
  getProfile = (userId: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw SettingError.getProfileError(error.message);
        return keysToCamel(data) as UserProfile;
      },
      catch: (error: unknown) =>
        SettingError.getProfileError(
          error instanceof Error ? error.message : '',
        ),
    });

  /**
   * Update user profile
   */
  updateProfile = (userId: string, data: UpdateProfileData) =>
    Effect.tryPromise({
      try: async () => {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .update({
            address: data.address,
            email: data.email,
            avatar_url: data.avatarUrl,
            full_name: data.fullName,
            phone_number: data.phoneNumber,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) throw SettingError.updateProfileError(error.message);
        return keysToCamel(profile) as UserProfile;
      },
      catch: (error: unknown) =>
        SettingError.updateProfileError(
          error instanceof Error ? error.message : '',
        ),
    });

  /**
   * Upload avatar and return URL (doesn't update profile yet)
   */
  uploadAvatar = (
    userId: string,
    file: { uri: string; type?: string; name?: string },
  ) =>
    Effect.tryPromise({
      try: async () => {
        const profile = await runEffectForQuery(this.getProfile(userId));

        if (profile?.avatarUrl) {
          await runEffectForQuery(this.deleteAvatar(profile.avatarUrl));
        }

        const fileExt = file.uri.split('.').pop() || 'jpg';
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Convert base64 to ArrayBuffer
        const arrayBuffer = decode(base64);

        const { data, error: uploadError } = await supabase.storage
          .from('user-avatar')
          .upload(filePath, arrayBuffer, {
            cacheControl: '3600',
            contentType: file.type || 'image/jpeg',
            upsert: true,
          });

        if (uploadError)
          throw SettingError.uploadAvatarError(uploadError.message);

        const {
          data: { publicUrl },
        } = supabase.storage.from('user-avatar').getPublicUrl(data.path);

        await runEffectForQuery(
          this.updateProfile(userId, { avatarUrl: publicUrl }),
        );

        return publicUrl;
      },
      catch: (error: unknown) =>
        SettingError.uploadAvatarError(
          error instanceof Error ? error.message : '',
        ),
    });

  /**
   * Delete old avatar from storage
   */
  deleteAvatar = (avatarUrl: string) =>
    Effect.tryPromise({
      try: async () => {
        const urlParts = avatarUrl.split('/avatars/');
        if (urlParts.length < 2) return;

        const filePath = `avatars/${urlParts[1]}`;

        const { error } = await supabase.storage
          .from('user-avatar')
          .remove([filePath]);

        if (error) throw SettingError.deleteAvatarError(error.message);
      },
      catch: (error: unknown) =>
        SettingError.deleteAvatarError(
          error instanceof Error ? error.message : '',
        ),
    });
}

export const profileService = ProfileService.getInstance();
