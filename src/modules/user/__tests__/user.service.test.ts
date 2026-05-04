import { describe, expect, it, vi } from 'vitest';

// Constants
import { USER_ROLE } from '@/constants/enum.ts';
import { USER_ERROR } from '@/constants/error-messages.ts';
import { STATUS_CODE } from '@/constants/status-code.ts';

// Module
import type {
  User,
  UserCreateInput,
  UserRepository,
} from '@/modules/user/user.repository.ts';

// Service
import { UserService } from '@/modules/user/user.service.ts';

// Type
import type { APIResponse } from '@/types/response.ts';

const dates = {
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date('2020-01-02'),
};

const userRow = (
  overrides: Partial<APIResponse<User>> = {},
): APIResponse<User> => {
  return {
    id: 'user-1',
    email: 'a@b.com',
    firstName: 'A',
    lastName: 'B',
    role: USER_ROLE.USER,
    ...dates,
    ...overrides,
  };
};

const makeRepo = (partial: Partial<UserRepository> = {}): UserRepository => {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    updateById: vi.fn(),
    deleteById: vi.fn(),
    ...partial,
  };
};

describe('UserService', () => {
  it('create returns user or throws', async () => {
    const row = userRow();
    const repo = makeRepo({ create: vi.fn().mockResolvedValue(row) });
    const userServic = new UserService(repo);
    const input: UserCreateInput = {
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
    };

    await expect(userServic.create(input)).resolves.toEqual(row);

    repo.create = vi.fn().mockResolvedValue(null);
    await expect(userServic.create(input)).rejects.toMatchObject({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: USER_ERROR.FAILED_TO_CREATE_USER,
    });
  });

  it('syncUserProfile updates when user exists', async () => {
    const existing = userRow();
    const updated = userRow({ firstName: 'New' });
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(existing),
      updateById: vi.fn().mockResolvedValue(updated),
    });
    const userServic = new UserService(repo);

    const input: UserCreateInput = {
      id: existing.id,
      email: existing.email,
      firstName: 'New',
      lastName: existing.lastName,
    };

    await expect(userServic.syncUserProfile(input)).resolves.toEqual(updated);
    expect(repo.updateById).toHaveBeenCalledWith(existing.id, {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
    });
  });

  it('syncUserProfile creates when user is new', async () => {
    const row = userRow();
    const input: UserCreateInput = {
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
    };
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(row),
    });
    const userServic = new UserService(repo);

    await expect(userServic.syncUserProfile(input)).resolves.toEqual(row);
    expect(repo.create).toHaveBeenCalledWith(input);
  });

  it('syncUserProfile throws when update returns null', async () => {
    const existing = userRow();
    const input: UserCreateInput = {
      id: existing.id,
      email: existing.email,
      firstName: 'N',
      lastName: existing.lastName,
    };
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(existing),
      updateById: vi.fn().mockResolvedValue(null),
    });
    const userServic = new UserService(repo);

    await expect(userServic.syncUserProfile(input)).rejects.toMatchObject({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: USER_ERROR.FAILED_TO_UPDATE_USER,
    });
  });

  it('findAll delegates to repository', async () => {
    const rows = [userRow()];
    const repo = makeRepo({ findAll: vi.fn().mockResolvedValue(rows) });
    const userServic = new UserService(repo);

    await expect(userServic.findAll()).resolves.toEqual(rows);
  });

  it('findById returns user or NOT_FOUND', async () => {
    const row = userRow();
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(row) });
    const userServic = new UserService(repo);

    await expect(userServic.findById('user-1')).resolves.toEqual(row);

    repo.findById = vi.fn().mockResolvedValue(null);
    await expect(userServic.findById('missing')).rejects.toMatchObject({
      status: STATUS_CODE.NOT_FOUND,
      message: USER_ERROR.USER_NOT_FOUND,
    });
  });

  it('promoteUserToAdmin rejects already admin', async () => {
    const admin = userRow({ role: USER_ROLE.ADMIN });
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(admin) });
    const userServic = new UserService(repo);

    await expect(userServic.promoteUserToAdmin(admin.id)).rejects.toMatchObject(
      {
        status: STATUS_CODE.CONFLICT,
        message: USER_ERROR.USER_ALREADY_ADMIN,
      },
    );
  });

  it('promoteUserToAdmin updates role', async () => {
    const row = userRow();
    const promoted = userRow({ role: USER_ROLE.ADMIN });
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(row),
      updateById: vi.fn().mockResolvedValue(promoted),
    });
    const userServic = new UserService(repo);

    await expect(userServic.promoteUserToAdmin(row.id)).resolves.toEqual(
      promoted,
    );
    expect(repo.updateById).toHaveBeenCalledWith(row.id, {
      role: USER_ROLE.ADMIN,
    });
  });

  it('promoteUserToAdmin throws when update returns null', async () => {
    const row = userRow();
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(row),
      updateById: vi.fn().mockResolvedValue(null),
    });
    const userServic = new UserService(repo);

    await expect(userServic.promoteUserToAdmin(row.id)).rejects.toMatchObject({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: USER_ERROR.FAILED_TO_UPDATE_USER,
    });
  });

  it('deleteUserById removes after existence check', async () => {
    const row = userRow();
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(row),
      deleteById: vi.fn().mockResolvedValue(undefined),
    });
    const userServic = new UserService(repo);

    await userServic.deleteUserById(row.id);
    expect(repo.deleteById).toHaveBeenCalledWith(row.id);
  });
});
