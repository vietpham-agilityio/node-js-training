import express, { type Express, type RequestHandler } from 'express';
import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';

// Constants
import { COURSE_STATUS } from '@/constants/enum.ts';
import { STATUS_CODE } from '@/constants/status-code.ts';

// Routes
import { createCourseRouter } from '@/modules/course/course.route.ts';

// Services
import type { CourseService } from '@/modules/course/course.service.ts';

const allow: RequestHandler = (_req, _res, next) => {
  next();
};

const makeCourseServiceMock = (): CourseService => {
  return {
    findAll: vi.fn(),
    findAllForAdmin: vi.fn(),
    findPublishedById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as CourseService;
};

const mount = (courseService: CourseService): Express => {
  const app = express();
  app.use(express.json());
  app.use(
    '/courses',
    createCourseRouter({
      courseService,
      requireAuth: allow,
      requireAdmin: allow,
    }),
  );
  return app;
};

describe('createCourseRouter', () => {
  it('GET / lists published courses for authenticated users', async () => {
    const payload = [
      {
        id: '1',
        title: 'A',
        description: 'B',
        price: 0,
        isFree: true,
        status: COURSE_STATUS.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const courseService = makeCourseServiceMock();
    vi.mocked(courseService.findAll).mockResolvedValue(payload);

    const res = await request(mount(courseService)).get('/courses');

    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '1', title: 'A' }),
      ]),
    );
    expect(courseService.findAll).toHaveBeenCalledOnce();
  });

  it('GET /all returns every course for admins', async () => {
    const courseService = makeCourseServiceMock();
    vi.mocked(courseService.findAllForAdmin).mockResolvedValue([]);

    const res = await request(mount(courseService)).get('/courses/all');

    expect(res.status).toBe(STATUS_CODE.OK);
    expect(courseService.findAllForAdmin).toHaveBeenCalledOnce();
  });

  it('GET /:id returns a single published course', async () => {
    const row = {
      id: 'c1',
      title: 'T',
      description: 'D',
      price: 1,
      isFree: false,
      status: COURSE_STATUS.PUBLISHED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const courseService = makeCourseServiceMock();
    vi.mocked(courseService.findPublishedById).mockResolvedValue(row);

    const res = await request(mount(courseService)).get('/courses/c1');

    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body).toMatchObject({ id: 'c1' });
    expect(courseService.findPublishedById).toHaveBeenCalledWith('c1');
  });

  it('PUT /:id updates a course', async () => {
    const body = { title: 'U' };
    const updated = {
      id: 'c1',
      title: 'U',
      description: 'D',
      price: 0,
      isFree: true,
      status: COURSE_STATUS.PUBLISHED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const courseService = makeCourseServiceMock();
    vi.mocked(courseService.update).mockResolvedValue(updated);

    const res = await request(mount(courseService))
      .put('/courses/c1')
      .send(body);

    expect(res.status).toBe(STATUS_CODE.OK);
    expect(courseService.update).toHaveBeenCalledWith('c1', body);
  });

  it('POST / creates a course', async () => {
    const body = {
      title: 'New',
      description: 'Desc',
      price: 9.99,
      isFree: false,
      status: COURSE_STATUS.UNPUBLISHED,
    };
    const created = {
      ...body,
      id: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const courseService = makeCourseServiceMock();
    vi.mocked(courseService.create).mockResolvedValue(created);

    const res = await request(mount(courseService)).post('/courses').send(body);

    expect(res.status).toBe(STATUS_CODE.CREATED);
    expect(courseService.create).toHaveBeenCalledWith(body);
  });

  it('DELETE /:id responds with success message', async () => {
    const courseService = makeCourseServiceMock();
    vi.mocked(courseService.delete).mockResolvedValue(undefined);

    const res = await request(mount(courseService)).delete('/courses/x');

    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body).toEqual({ message: 'Course is deleted successfully' });
    expect(courseService.delete).toHaveBeenCalledWith('x');
  });
});
