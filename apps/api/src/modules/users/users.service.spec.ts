import * as bcrypt from 'bcrypt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/exceptions/error-codes';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { UsersService } from './users.service';

type MockRepo<T extends object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

function mockRepo<T extends object>(): MockRepo<T> {
  return {
    create: jest.fn((entity) => entity),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    merge: jest.fn((entity, data) => ({ ...entity, ...data })),
  };
}

describe('UsersService', () => {
  let service: UsersService;
  let repo: MockRepo<User>;

  const baseUser: User = {
    id: 'u1',
    email: 'user@example.com',
    passwordHash: '',
    firstName: 'A',
    lastName: 'B',
    phoneNumber: null,
    dateOfBirth: null,
    address: null,
    avatarUrl: null,
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    refreshTokens: [],
    seatHolds: [],
    reservations: [],
  };

  beforeEach(async () => {
    repo = mockRepo<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('getProfile / findAllUsers', () => {
    it('never includes passwordHash in the returned shape', async () => {
      repo.findOne!.mockResolvedValue({
        ...baseUser,
        passwordHash: 'super-secret-hash',
      });

      const result = await service.getProfile('u1');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toBe('u1');
    });

    it('maps every row in a paginated list, preserving meta', async () => {
      repo.findAndCount!.mockResolvedValue([[baseUser], 1]);

      const result = await service.findAllUsers({
        page: 1,
        limit: 20,
        skip: 0,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('passwordHash');
      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        hasMore: false,
      });
    });
  });

  describe('changePassword', () => {
    it('hashes and persists a new password when the current one is correct', async () => {
      const passwordHash = await bcrypt.hash('current-password', 4);
      repo.findOne!.mockResolvedValue({ ...baseUser, passwordHash });
      repo.update!.mockResolvedValue({});

      await service.changePassword('u1', {
        currentPassword: 'current-password',
        newPassword: 'new-password',
      });

      expect(repo.update).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ passwordHash: expect.any(String) }),
      );
    });

    it('rejects a wrong current password without touching the repository', async () => {
      const passwordHash = await bcrypt.hash('current-password', 4);
      repo.findOne!.mockResolvedValue({ ...baseUser, passwordHash });

      await expect(
        service.changePassword('u1', {
          currentPassword: 'wrong-password',
          newPassword: 'new-password',
        }),
      ).rejects.toMatchObject({ errorCode: ErrorCode.INVALID_CREDENTIALS });

      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('updateByAdmin', () => {
    it('rejects an admin targeting their own account', async () => {
      await expect(
        service.updateByAdmin('admin1', 'admin1', { isActive: false }),
      ).rejects.toMatchObject({
        errorCode: ErrorCode.ADMIN_SELF_ACTION_FORBIDDEN,
      });

      expect(repo.findOne).not.toHaveBeenCalled();
    });

    it('updates role/active status on another user', async () => {
      repo.findOne!.mockResolvedValue(baseUser);
      repo.save!.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.updateByAdmin('admin1', 'u1', {
        role: UserRole.ADMIN,
      });

      expect(repo.merge).toHaveBeenCalledWith(baseUser, {
        role: UserRole.ADMIN,
      });
      expect(result.role).toBe(UserRole.ADMIN);
    });
  });

  describe('remove / removeByAdmin', () => {
    it('rejects an admin targeting their own account', async () => {
      await expect(service.removeByAdmin('admin1', 'admin1')).rejects.toThrow(
        AppException,
      );

      expect(repo.findOne).not.toHaveBeenCalled();
    });

    it('404s via findOne when the target does not exist', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(service.removeByAdmin('admin1', 'missing')).rejects.toThrow(
        'User with id missing not found',
      );

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('soft-deletes by flipping isActive to false, not deleting the row', async () => {
      repo.findOne!.mockResolvedValue(baseUser);
      repo.update!.mockResolvedValue({});

      await service.removeByAdmin('admin1', 'u1');

      expect(repo.update).toHaveBeenCalledWith('u1', { isActive: false });
    });
  });
});
