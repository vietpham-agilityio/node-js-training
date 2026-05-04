import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express, RequestHandler } from 'express';
import { DataSource } from 'typeorm';

// Constant
import { ROUTES } from '@/constants/route.ts';
import { COURSE_STATUS, USER_ROLE } from '@/constants/enum.ts';
import { STATUS_CODE } from '@/constants/status-code.ts';

// Module
import { UserEntity } from '@/modules/user/user.entity.ts';
import { CourseEntity } from '@/modules/course/course.entity.ts';
import { UserCourseEntity } from '@/modules/userCourse/user-course.entity.ts';

// Migration
import { CreateUsersTable1709000000006 } from '@/migrations/CreateUsersTable1709000000006.ts';
import { CreateCoursesTable1709000000007 } from '@/migrations/CreateCoursesTable1709000000007.ts';
import { CreateUserCoursesTable1709000000013 } from '@/migrations/CreateUserCoursesTable1709000000013.ts';

const clerkMock = vi.hoisted(() => ({
  getAuth: vi.fn(),
}));

vi.mock('@clerk/express', () => ({
  clerkMiddleware: (): RequestHandler => (_req, _res, next) => {
    next();
  },
  getAuth: (...args: unknown[]): unknown => clerkMock.getAuth(...args),
}));

import createApp from '@/app.ts';

const ADMIN_ID = 'integration-admin-1';

describe('Admin course CRUD (integration)', () => {
  let dataSource: DataSource;
  let app: Express;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: { UserEntity, CourseEntity, UserCourseEntity },
      migrations: {
        CreateUsersTable1709000000006,
        CreateCoursesTable1709000000007,
        CreateUserCoursesTable1709000000013,
      },
      migrationsRun: true,
      synchronize: false,
      logging: false,
    });

    await dataSource.initialize();

    await dataSource.getRepository(UserEntity).save({
      id: ADMIN_ID,
      email: 'admin.integration@test.local',
      firstName: 'Admin',
      lastName: 'Integration',
      role: USER_ROLE.ADMIN,
    });

    clerkMock.getAuth.mockReturnValue({ userId: ADMIN_ID });

    app = createApp(dataSource);
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('creates, lists all, updates, reads published by id, and deletes a course', async () => {
    const createBody = {
      title: 'Integration Course',
      description: 'Created by integration test',
      price: 1000,
      isFree: false,
      status: COURSE_STATUS.UNPUBLISHED,
    };

    const createRes = await request(app).post(ROUTES.COURSES).send(createBody);

    expect(createRes.status).toBe(STATUS_CODE.CREATED);
    expect(createRes.body).toMatchObject({
      title: createBody.title,
      status: COURSE_STATUS.UNPUBLISHED,
    });
    const courseId = createRes.body.id as string;
    expect(courseId).toBeTruthy();

    const listRes = await request(app).get(`${ROUTES.COURSES}/all`);

    expect(listRes.status).toBe(STATUS_CODE.OK);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.some((c: { id: string }) => c.id === courseId)).toBe(
      true,
    );

    const updateBody = {
      title: 'Updated title',
      status: COURSE_STATUS.PUBLISHED,
    };

    const updateRes = await request(app)
      .put(`${ROUTES.COURSES}/${courseId}`)
      .send(updateBody);

    expect(updateRes.status).toBe(STATUS_CODE.OK);
    expect(updateRes.body).toMatchObject({
      id: courseId,
      title: updateBody.title,
      status: COURSE_STATUS.PUBLISHED,
    });

    const getPublishedRes = await request(app).get(
      `${ROUTES.COURSES}/${courseId}`,
    );

    expect(getPublishedRes.status).toBe(STATUS_CODE.OK);
    expect(getPublishedRes.body).toMatchObject({
      id: courseId,
      title: updateBody.title,
    });

    const deleteRes = await request(app).delete(
      `${ROUTES.COURSES}/${courseId}`,
    );

    expect(deleteRes.status).toBe(STATUS_CODE.OK);
    expect(deleteRes.body).toMatchObject({
      message: 'Course is deleted successfully',
    });

    const afterDelete = await request(app).get(`${ROUTES.COURSES}/all`);

    expect(afterDelete.status).toBe(STATUS_CODE.OK);
    expect(
      afterDelete.body.some((c: { id: string }) => c.id === courseId),
    ).toBe(false);
  });
});
