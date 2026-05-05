import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Types
import type { UserCourseRepository } from '@/modules/userCourse/user-course.repository.ts';
import type { UserCourseResponse } from '@/modules/userCourse/user-course.repository.ts';

// Service
import { UserCourseService } from '@/modules/userCourse/user-course.service.ts';

const enrollment = (
  overrides: Partial<UserCourseResponse> = {},
): UserCourseResponse => {
  return {
    id: 1,
    userId: 'user-1',
    courseId: 10,
    stripeSessionId: null,
    grantedAt: new Date().toISOString(),
    ...overrides,
  };
};

const makeRepo = (
  partial: Partial<UserCourseRepository> = {},
): UserCourseRepository => {
  return {
    grantCourseAccess: vi.fn(),
    existsByStripeSessionId: vi.fn(),
    findByUserId: vi.fn(),
    ...partial,
  };
};

describe('UserCourseService', () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    infoSpy.mockRestore();
  });

  it('grantCourseAccess calls repository when no session id', async () => {
    const record = enrollment();
    const repo = makeRepo({
      grantCourseAccess: vi.fn().mockResolvedValue(record),
    });

    const userCourserService = new UserCourseService(repo);

    await expect(
      userCourserService.grantCourseAccess('user-1', 10),
    ).resolves.toEqual(record);

    expect(repo.grantCourseAccess).toHaveBeenCalledWith(
      'user-1',
      10,
      undefined,
    );
    expect(repo.existsByStripeSessionId).not.toHaveBeenCalled();
  });

  it('grantCourseAccess skips duplicate stripe session when enrollment exists', async () => {
    const record = enrollment({ courseId: 10 });
    const repo = makeRepo({
      existsByStripeSessionId: vi.fn().mockResolvedValue(true),
      findByUserId: vi
        .fn()
        .mockResolvedValue([enrollment({ courseId: 9 }), record]),
      grantCourseAccess: vi.fn(),
    });
    const userCourserService = new UserCourseService(repo);

    await expect(
      userCourserService.grantCourseAccess('user-1', 10, 'sess_1'),
    ).resolves.toEqual(record);
    expect(repo.grantCourseAccess).not.toHaveBeenCalled();
  });

  it('listForUser delegates to repository', async () => {
    const rows = [enrollment()];
    const repo = makeRepo({ findByUserId: vi.fn().mockResolvedValue(rows) });
    const userCourserService = new UserCourseService(repo);

    await expect(userCourserService.listForUser('user-1')).resolves.toEqual(
      rows,
    );
    expect(repo.findByUserId).toHaveBeenCalledWith('user-1');
  });
});
