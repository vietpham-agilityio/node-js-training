import { Effect, Layer } from 'effect';

// Services
import { profileService } from '../../services/profile';

// Types
import { UpdateProfileData } from '@/features/auth/types/auth';

// Effect
import { ProfileService } from '../services/profile';

export const ProfileServiceLayer = Layer.effect(
  ProfileService,
  Effect.gen(function* () {
    return {
      getProfile: (userId: string) => profileService.getProfile(userId),

      updateProfile: (userId: string, data: UpdateProfileData) =>
        profileService.updateProfile(userId, data),

      uploadAvatar: (
        userId: string,
        file: { uri: string; type?: string; name?: string },
      ) => profileService.uploadAvatar(userId, file),

      deleteAvatar: (avatarUrl: string) =>
        profileService.deleteAvatar(avatarUrl),
    } as const;
  }),
);
