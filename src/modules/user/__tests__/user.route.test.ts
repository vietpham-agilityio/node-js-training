import request from 'supertest';
import express, { type Express, type RequestHandler } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Constants
import { USER_ROLE } from '@/constants/enum.ts';
import { STATUS_CODE } from '@/constants/status-code.ts';

// Module
import { createUserRoutes } from '@/modules/user/user.route.ts';

// Type
import type { UserService } from '@/modules/user/user.service.ts';
import type { UserCourseService } from '@/modules/userCourse/user-course.service.ts';
import { AppError } from '@/types/error.ts';

const clerkAuth = vi.hoisted(() => ({
  getAuth: vi.fn(),
}));

vi.mock('@clerk/express', () => ({
  getAuth: (...args: unknown[]) => clerkAuth.getAuth(...args),
}));

const allow: RequestHandler = (_req, _res, next) => {
  next();
};

const makeUserServiceMock = (): UserService => {
  return {
    findById: vi.fn(),
    findAll: vi.fn(),
    promoteUserToAdmin: vi.fn(),
    deleteUserById: vi.fn(),
    create: vi.fn(),
    syncUserProfile: vi.fn(),
  } as unknown as UserService;
};

const makeUserCourseServiceMock = (): UserCourseService => {
  return {
    grantCourseAccess: vi.fn(),
    listForUser: vi.fn(),
  } as unknown as UserCourseService;
};

const mount = (
  userService: UserService,
  userCourseService: UserCourseService,
): Express => {
  const app = express();
  app.use(express.json());
  app.use(
    '/users',
    createUserRoutes({
      userService,
      userCourseService,
      requireAuth: allow,
      requireAdmin: allow,
    }),
  );
  app.use(
    (
      err: AppError,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      res.status(err.status).json({ message: err.message });
    },
  );
  return app;
};

describe('createUserRoutes', () => {
  beforeEach(() => {
    clerkAuth.getAuth.mockReset();
    clerkAuth.getAuth.mockReturnValue({ userId: 'clerk-user-1' });
  });

  it('GET /me returns the authenticated profile', async () => {
    const user = {
      id: 'clerk-user-1',
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      role: USER_ROLE.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userService = makeUserServiceMock();
    vi.mocked(userService.findById).mockResolvedValue(user);

    const res = await request(
      mount(userService, makeUserCourseServiceMock()),
    ).get('/users/me');

    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body).toMatchObject({ id: 'clerk-user-1' });
    expect(userService.findById).toHaveBeenCalledWith('clerk-user-1');
  });

  it('GET /me returns 401 when Clerk user id is missing', async () => {
    clerkAuth.getAuth.mockReturnValue({ userId: null });

    const res = await request(
      mount(makeUserServiceMock(), makeUserCourseServiceMock()),
    ).get('/users/me');

    expect(res.status).toBe(STATUS_CODE.UNAUTHORIZED);
  });

  it('GET /me/courses lists enrollments', async () => {
    const rows = [
      {
        id: 1,
        userId: 'clerk-user-1',
        courseId: 5,
        stripeSessionId: null,
        grantedAt: new Date().toISOString(),
      },
    ];
    const userCourseService = makeUserCourseServiceMock();
    vi.mocked(userCourseService.listForUser).mockResolvedValue(rows);

    const res = await request(
      mount(makeUserServiceMock(), userCourseService),
    ).get('/users/me/courses');

    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body).toEqual(rows);
    expect(userCourseService.listForUser).toHaveBeenCalledWith('clerk-user-1');
  });

  it('GET /me/courses returns 401 without auth context', async () => {
    clerkAuth.getAuth.mockReturnValue({});

    const res = await request(
      mount(makeUserServiceMock(), makeUserCourseServiceMock()),
    ).get('/users/me/courses');

    expect(res.status).toBe(STATUS_CODE.UNAUTHORIZED);
    expect(res.body).toMatchObject({ error: expect.any(String) });
  });

  it('GET /:id loads another user for admins', async () => {
    const user = {
      id: 'other',
      email: 'o@b.com',
      firstName: 'O',
      lastName: 'P',
      role: USER_ROLE.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userService = makeUserServiceMock();
    vi.mocked(userService.findById).mockResolvedValue(user);

    const res = await request(
      mount(userService, makeUserCourseServiceMock()),
    ).get('/users/other');

    expect(res.status).toBe(STATUS_CODE.OK);
    expect(userService.findById).toHaveBeenCalledWith('other');
  });

  it('GET / lists users for admins', async () => {
    const users = [
      {
        id: 'u1',
        email: 'a@b.com',
        firstName: 'A',
        lastName: 'B',
        role: USER_ROLE.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const userService = makeUserServiceMock();
    vi.mocked(userService.findAll).mockResolvedValue(users);

    const res = await request(
      mount(userService, makeUserCourseServiceMock()),
    ).get('/users/');

    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: 'u1',
      email: 'a@b.com',
      role: USER_ROLE.USER,
    });
  });

  it('POST /:id/promote promotes a user', async () => {
    const promoted = {
      id: 'u1',
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      role: USER_ROLE.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userService = makeUserServiceMock();
    vi.mocked(userService.promoteUserToAdmin).mockResolvedValue(promoted);

    const res = await request(
      mount(userService, makeUserCourseServiceMock()),
    ).post('/users/u1/promote');

    expect(res.status).toBe(STATUS_CODE.OK);
    expect(userService.promoteUserToAdmin).toHaveBeenCalledWith('u1');
  });

  it('DELETE /:id removes a user', async () => {
    const userService = makeUserServiceMock();
    vi.mocked(userService.deleteUserById).mockResolvedValue(undefined);

    const res = await request(
      mount(userService, makeUserCourseServiceMock()),
    ).delete('/users/u1');

    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body).toEqual({ message: 'User is deleted successfully' });
    expect(userService.deleteUserById).toHaveBeenCalledWith('u1');
  });
});
