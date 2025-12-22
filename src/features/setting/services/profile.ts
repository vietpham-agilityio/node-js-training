import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '@/services/supabase/client';

// Types
import { UpdateProfileData, UserProfile } from '@/features/auth/types/auth';

// Utils
import { keysToCamel } from '@/utils/convert';

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
  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return keysToCamel(data) as UserProfile;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileData,
  ): Promise<UserProfile> {
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

    if (error) throw error;
    return keysToCamel(profile) as UserProfile;
  }

  /**
   * Upload avatar and return URL (doesn't update profile yet)
   */
  async uploadAvatar(
    userId: string,
    file: { uri: string; type?: string; name?: string },
  ): Promise<string> {
    const profile = await this.getProfile(userId);

    if (profile.avatarUrl) {
      await this.deleteAvatar(profile.avatarUrl);
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

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('user-avatar').getPublicUrl(data.path);

    await this.updateProfile(userId, { avatarUrl: publicUrl });

    return publicUrl;
  }

  /**
   * Delete old avatar from storage
   */
  async deleteAvatar(avatarUrl: string): Promise<void> {
    try {
      const urlParts = avatarUrl.split('/avatars/');
      if (urlParts.length < 2) return;

      const filePath = `avatars/${urlParts[1]}`;

      const { error } = await supabase.storage
        .from('user-avatar')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete old avatar:', error);
    }
  }
}

export const profileService = ProfileService.getInstance();
