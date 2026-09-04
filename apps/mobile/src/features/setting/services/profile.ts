import { supabase } from '@/services/supabase/client';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

// HTTP
import { apiRequest } from '@/services/api/client';

// Types
import type {
  UserProfile as ApiUserProfile,
  UpdateUserProfileRequest,
} from '@movea/api-contract';
import { UpdateProfileData, UserProfile } from '@/features/auth/types/auth';

// Utils
import { Effect } from 'effect';
import { SettingError } from '../error';
import { runEffectForQuery } from '@/utils/effect';

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : '';

// TODO(profile-migration): drop once screens read firstName/lastName directly
// and `UserProfile` is the contract type. Until then this keeps the shape the
// setting screens already consume.
const toUserProfile = ({
  id,
  email,
  firstName,
  lastName,
  phoneNumber,
  address,
  avatarUrl,
  createdAt,
  updatedAt,
}: ApiUserProfile): UserProfile => ({
  id,
  email,
  fullName: [firstName, lastName].filter(Boolean).join(' '),
  phoneNumber: phoneNumber ?? undefined,
  address: address ?? undefined,
  avatarUrl: avatarUrl ?? undefined,
  createdAt,
  updatedAt,
});

// `PATCH /users/me` only accepts the fields below. `fullName` and `email` are
// intentionally dropped: email is not editable via the API, and name needs the
// firstName/lastName form split that is a follow-up.
const toUpdateRequest = ({
  phoneNumber,
  address,
  avatarUrl,
}: UpdateProfileData): UpdateUserProfileRequest => ({
  ...(phoneNumber != null && { phoneNumber }),
  ...(address != null && { address }),
  ...(avatarUrl != null && { avatarUrl }),
});

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
   * Get the authenticated user's profile — `GET /users/me`.
   */
  getProfile = () =>
    Effect.tryPromise({
      try: async () => {
        const dto = await apiRequest<ApiUserProfile>('/users/me', {
          auth: true,
        });
        return toUserProfile(dto);
      },
      catch: (error: unknown) => SettingError.getProfileError(messageOf(error)),
    });

  /**
   * Update the authenticated user's profile — `PATCH /users/me`.
   */
  updateProfile = (data: UpdateProfileData) =>
    Effect.tryPromise({
      try: async () => {
        const dto = await apiRequest<ApiUserProfile>('/users/me', {
          method: 'PATCH',
          body: toUpdateRequest(data),
          auth: true,
        });
        return toUserProfile(dto);
      },
      catch: (error: unknown) =>
        SettingError.updateProfileError(messageOf(error)),
    });

  /**
   * Upload avatar and return URL (doesn't update profile yet).
   *
   * TODO(profile-migration): the binary still goes to Supabase Storage — the
   * API has no upload endpoint yet. The resulting URL is persisted through
   * `updateProfile` (`PATCH /users/me`).
   */
  uploadAvatar = (
    userId: string,
    file: { uri: string; type?: string; name?: string },
  ) =>
    Effect.tryPromise({
      try: async () => {
        const profile = await runEffectForQuery(this.getProfile());

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

        await runEffectForQuery(this.updateProfile({ avatarUrl: publicUrl }));

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
