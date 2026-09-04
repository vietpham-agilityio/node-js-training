import { apiRequest } from '@/services/api/client';
import { supabase } from '@/services/supabase/client';
import { runEffectForQuery } from '@/utils/effect';
import { decode } from 'base64-arraybuffer';
import { Effect } from 'effect';
import * as FileSystem from 'expo-file-system/legacy';
import { ProfileService, profileService } from '../profile';

// --- Universal Chainable Supabase Query Builder Mock ---
const createMockQueryBuilder = () => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn(),
  then: jest.fn(), // Handle await calls
});

const mockQueryBuilderInstance = createMockQueryBuilder();

const mockStorageBuilder = {
  upload: jest.fn(),
  remove: jest.fn(),
  getPublicUrl: jest.fn(),
};

jest.mock('@/services/api/client', () => ({
  apiRequest: jest.fn(),
}));

jest.mock('@/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => mockQueryBuilderInstance),
    rpc: jest.fn(),
    storage: {
      from: jest.fn(() => mockStorageBuilder),
    },
  },
}));

jest.mock('expo-file-system/legacy');
jest.mock('base64-arraybuffer');

const mockApiRequest = apiRequest as jest.Mock;

// `GET /users/me` payload — the API models the name as firstName/lastName.
const API_PROFILE = {
  id: 'user1',
  email: 'user1@example.com',
  firstName: 'New',
  lastName: 'Name',
  phoneNumber: null,
  dateOfBirth: null,
  address: null,
  avatarUrl: null,
  role: 'user',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ProfileService', () => {
  let service: ProfileService;
  const storageFrom = supabase.storage.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = ProfileService.getInstance();

    // Configure mockStorageBuilder
    mockStorageBuilder.upload.mockResolvedValue({
      data: { path: 'mock/path' },
      error: null,
    });
    mockStorageBuilder.remove.mockResolvedValue({ error: null });
    mockStorageBuilder.getPublicUrl.mockReturnValue({
      data: { publicUrl: 'mock-public-url' },
    });
  });

  it('should be a singleton', () => {
    const instance1 = ProfileService.getInstance();
    const instance2 = ProfileService.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(profileService);
  });

  describe('getProfile', () => {
    it('fetches the authenticated user profile from /users/me', async () => {
      mockApiRequest.mockResolvedValue(API_PROFILE);

      const profile = await runEffectForQuery(service.getProfile());

      expect(mockApiRequest).toHaveBeenCalledWith('/users/me', { auth: true });
      expect(profile).toEqual({
        id: 'user1',
        email: 'user1@example.com',
        fullName: 'New Name',
        phoneNumber: undefined,
        address: undefined,
        avatarUrl: undefined,
        createdAt: API_PROFILE.createdAt,
        updatedAt: API_PROFILE.updatedAt,
      });
    });

    it('throws a SettingError if the request fails', async () => {
      mockApiRequest.mockRejectedValue(new Error('Fetch profile failed'));

      await expect(runEffectForQuery(service.getProfile())).rejects.toThrow(
        'Fetch profile failed',
      );
    });
  });

  describe('updateProfile', () => {
    it('sends only the API-mappable fields to PATCH /users/me', async () => {
      mockApiRequest.mockResolvedValue({ ...API_PROFILE, address: '1 New St' });

      const profile = await runEffectForQuery(
        service.updateProfile({
          fullName: 'Ignored',
          email: 'ignored@example.com',
          address: '1 New St',
          phoneNumber: '0123456789',
        }),
      );

      expect(mockApiRequest).toHaveBeenCalledWith('/users/me', {
        method: 'PATCH',
        body: { address: '1 New St', phoneNumber: '0123456789' },
        auth: true,
      });
      expect(profile.address).toBe('1 New St');
      expect(profile.fullName).toBe('New Name');
    });

    it('throws a SettingError if the update fails', async () => {
      mockApiRequest.mockRejectedValue(new Error('Update failed'));

      await expect(
        runEffectForQuery(service.updateProfile({})),
      ).rejects.toThrow('Update failed');
    });
  });

  describe('uploadAvatar', () => {
    const userId = 'user1';
    const file = { uri: 'file://path/to/avatar.jpg', type: 'image/jpeg' };
    const publicUrl = 'mock-public-url'; // Matches mockStorageBuilder.getPublicUrl
    const mockProfile = { id: userId, avatar_url: null };
    const arrayBuffer = new ArrayBuffer(8);

    beforeEach(() => {
      jest
        .spyOn(service, 'getProfile')
        .mockReturnValue(Effect.succeed(mockProfile));
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
        'base64str',
      );
      (decode as jest.Mock).mockReturnValue(arrayBuffer);
      jest
        .spyOn(service, 'updateProfile')
        .mockReturnValue(Effect.succeed({ id: '', avatarUrl: publicUrl }));
    });

    it('should upload an avatar and return the public URL', async () => {
      const url = await runEffectForQuery(service.uploadAvatar(userId, file));

      expect(service.getProfile).toHaveBeenCalledWith();
      expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      expect(decode).toHaveBeenCalledWith('base64str');
      expect(storageFrom).toHaveBeenCalledWith('user-avatar');
      expect(mockStorageBuilder.upload).toHaveBeenCalledWith(
        expect.any(String),
        arrayBuffer,
        expect.any(Object),
      );
      expect(mockStorageBuilder.getPublicUrl).toHaveBeenCalledWith('mock/path'); // Path returned by upload
      expect(service.updateProfile).toHaveBeenCalledWith({
        avatarUrl: publicUrl,
      });
      expect(url).toBe(publicUrl);
    });

    it('should delete old avatar if one exists', async () => {
      const oldUrl = 'http://supabase.io/public/avatars/old.jpg';

      jest.spyOn(service, 'getProfile').mockReturnValue(
        Effect.succeed({
          ...mockProfile,
          avatarUrl: oldUrl,
        }),
      );

      const deleteSpy = jest
        .spyOn(service, 'deleteAvatar')
        .mockReturnValue(Effect.succeed(undefined));

      await runEffectForQuery(service.uploadAvatar(userId, file));

      expect(deleteSpy).toHaveBeenCalledWith(oldUrl);
    });

    it('should throw an error if avatar upload fails', async () => {
      const error = new Error('Upload failed');
      mockStorageBuilder.upload.mockResolvedValueOnce({ data: null, error });

      await expect(
        runEffectForQuery(service.uploadAvatar(userId, file)),
      ).rejects.toThrow(error);
    });
  });

  describe('deleteAvatar', () => {
    beforeEach(() => {
      jest.restoreAllMocks(); // ✅ restore real implementation
    });

    it('should remove an avatar from storage', async () => {
      const avatarUrl = 'http://example.com/avatars/user1-123.jpg';

      await runEffectForQuery(service.deleteAvatar(avatarUrl));

      expect(storageFrom).toHaveBeenCalledWith('user-avatar');
      expect(mockStorageBuilder.remove).toHaveBeenCalledWith([
        'avatars/user1-123.jpg',
      ]);
    });

    it('should not throw error if avatarUrl is malformed', async () => {
      const avatarUrl = 'malformed-url';
      await expect(
        runEffectForQuery(service.deleteAvatar(avatarUrl)),
      ).resolves.not.toThrow();
    });
  });
});
