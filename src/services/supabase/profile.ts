import { UpdateProfileData, UserProfile } from '@/types';
import { keysToCamel } from '@/utils';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './client';

export class ProfileService {
  private static instance: ProfileService;

  private constructor() {}

  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return keysToCamel(data) as UserProfile;
  }

  async updateProfile(
    userId: string,
    updates: UpdateProfileData,
  ): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        address: updates.address,
        email: updates.email,
        avatar_url: updates.avatarUrl,
        full_name: updates.fullName,
        phone_number: updates.phoneNumber,
      })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return keysToCamel(data) as UserProfile;
  }

  async uploadAvatar(
    userId: string,
    file: { uri: string; type?: string; name?: string },
  ) {
    const fileExt = file.uri.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    const { data, error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, arrayBuffer, {
        cacheControl: '3600',
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('user-avatars').getPublicUrl(data.path);

    await this.updateProfile(userId, { avatarUrl: publicUrl });
    return publicUrl;
  }
}

export const profileService = ProfileService.getInstance();
