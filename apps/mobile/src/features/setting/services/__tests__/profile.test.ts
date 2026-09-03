import { supabase } from '@/services/supabase/client';
import { keysToCamel } from '@/utils/convert';
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
jest.unmock('@/utils/convert');

describe('ProfileService', () => {
  let service: ProfileService;
  const from = supabase.from as jest.Mock;
  const storageFrom = supabase.storage.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = ProfileService.getInstance();

    // Reset and configure mockQueryBuilderInstance
    Object.values(mockQueryBuilderInstance).forEach(mockFn => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockClear();
        if (mockFn.mockReturnThis) {
          mockFn.mockReturnThis();
        }
      }
    });
    (mockQueryBuilderInstance.then as jest.Mock).mockImplementation(resolve =>
      resolve({ data: [], error: null }),
    );
    (mockQueryBuilderInstance.single as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });

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
    it('should fetch a user profile', async () => {
      const mockProfile = { id: 'user1' };
      (mockQueryBuilderInstance.single as jest.Mock).mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const profile = await runEffectForQuery(service.getProfile('user1'));
      expect(from).toHaveBeenCalledWith('user_profiles');
      expect(mockQueryBuilderInstance.eq).toHaveBeenCalledWith('id', 'user1');
      expect(profile).toEqual(keysToCamel(mockProfile));
    });

    it('should throw an error if fetching profile fails', async () => {
      const error = new Error('Fetch profile failed');
      (mockQueryBuilderInstance.single as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      await expect(
        runEffectForQuery(service.getProfile('user1')),
      ).rejects.toThrow(error);
    });
  });

  describe('updateProfile', () => {
    it('should update a user profile', async () => {
      const updatedProfile = { id: 'user1', full_name: 'New Name' };
      const updateData = { fullName: 'New Name' };
      (mockQueryBuilderInstance.single as jest.Mock).mockResolvedValue({
        data: updatedProfile,
        error: null,
      });

      const profile = await runEffectForQuery(
        service.updateProfile('user1', updateData),
      );
      expect(from).toHaveBeenCalledWith('user_profiles');
      expect(mockQueryBuilderInstance.update).toHaveBeenCalledWith(
        expect.objectContaining({ full_name: 'New Name' }),
      );
      expect(profile).toEqual(keysToCamel(updatedProfile));
    });

    it('should throw an error if updating profile fails', async () => {
      const error = new Error('Update failed');
      (mockQueryBuilderInstance.single as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      await expect(
        runEffectForQuery(service.updateProfile('user1', {})),
      ).rejects.toThrow(error);
    });
  });

  describe('uploadAvatar', () => {
    const userId = 'user1';
    const file = { uri: 'file://path/to/avatar.jpg', type: 'image/jpeg' };
    const publicUrl = 'mock-public-url'; // Updated to match mockStorageBuilder.getPublicUrl
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

      expect(service.getProfile).toHaveBeenCalledWith(userId);
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
      expect(service.updateProfile).toHaveBeenCalledWith(userId, {
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
