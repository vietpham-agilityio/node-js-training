import { describe, expect, it, vi } from 'vitest';

// Constants
import { COURSE_STATUS } from '@/constants/enum.ts';
import { COURSE_ERROR } from '@/constants/error-messages.ts';
import { STATUS_CODE } from '@/constants/status-code.ts';

// Repository
import type {
  Course,
  CourseRepository,
} from '@/modules/course/course.repository.ts';

// Service
import { CourseService } from '@/modules/course/course.service.ts';

// Types
import type { APIResponse } from '@/types/response.ts';

const dates = {
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date('2020-01-02'),
};

const courseResponce = (
  overrides: Partial<APIResponse<Course>> = {},
): APIResponse<Course> => {
  return {
    id: 'course-1',
    title: 'T',
    description: 'D',
    price: 0,
    isFree: true,
    status: COURSE_STATUS.PUBLISHED,
    ...dates,
    ...overrides,
  };
};

const makeRepo = (
  partial: Partial<CourseRepository> = {},
): CourseRepository => {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    findAllPublished: vi.fn(),
    updateById: vi.fn(),
    deleteById: vi.fn(),
    ...partial,
  };
};

describe('CourseService', () => {
  it('create returns row when repository succeeds', async () => {
    const row = courseResponce();
    const repo = makeRepo({ create: vi.fn().mockResolvedValue(row) });
    const svc = new CourseService(repo);

    await expect(svc.create(row)).resolves.toEqual(row);
    expect(repo.create).toHaveBeenCalledWith(row);
  });

  it('create throws when repository returns null', async () => {
    const repo = makeRepo({ create: vi.fn().mockResolvedValue(null) });
    const svc = new CourseService(repo);

    await expect(svc.create(courseResponce())).rejects.toMatchObject({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: COURSE_ERROR.FAILED_TO_CREATE_COURSE,
    });
  });

  it('findAll returns published courses', async () => {
    const rows = [courseResponce()];
    const repo = makeRepo({
      findAllPublished: vi.fn().mockResolvedValue(rows),
    });
    const svc = new CourseService(repo);

    await expect(svc.findAll()).resolves.toEqual(rows);
  });

  it('findAll throws when repository returns null', async () => {
    const repo = makeRepo({
      findAllPublished: vi.fn().mockResolvedValue(null),
    });
    const svc = new CourseService(repo);

    await expect(svc.findAll()).rejects.toMatchObject({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: COURSE_ERROR.FAILED_TO_GET_ALL_COURSES,
    });
  });

  it('findAllForAdmin delegates to findAll', async () => {
    const rows = [courseResponce()];
    const repo = makeRepo({ findAll: vi.fn().mockResolvedValue(rows) });
    const svc = new CourseService(repo);

    await expect(svc.findAllForAdmin()).resolves.toEqual(rows);
    expect(repo.findAll).toHaveBeenCalled();
  });

  it('findById returns course or throws NOT_FOUND', async () => {
    const row = courseResponce();
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(row) });
    const svc = new CourseService(repo);

    await expect(svc.findById('course-1')).resolves.toEqual(row);

    repo.findById = vi.fn().mockResolvedValue(null);
    await expect(svc.findById('missing')).rejects.toMatchObject({
      status: STATUS_CODE.NOT_FOUND,
      message: COURSE_ERROR.COURSE_NOT_FOUND,
    });
  });

  it('findPublishedById returns published course', async () => {
    const row = courseResponce({ status: COURSE_STATUS.PUBLISHED });
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(row) });
    const svc = new CourseService(repo);

    await expect(svc.findPublishedById('course-1')).resolves.toEqual(row);
  });

  it('findPublishedById rejects draft or missing', async () => {
    const repo = makeRepo({
      findById: vi
        .fn()
        .mockResolvedValue(
          courseResponce({ status: COURSE_STATUS.UNPUBLISHED }),
        ),
    });
    const svc = new CourseService(repo);

    await expect(svc.findPublishedById('course-1')).rejects.toMatchObject({
      status: STATUS_CODE.NOT_FOUND,
      message: COURSE_ERROR.COURSE_NOT_FOUND,
    });
  });

  it('update returns row or throws on failure', async () => {
    const row = courseResponce();
    const repo = makeRepo({ updateById: vi.fn().mockResolvedValue(row) });
    const svc = new CourseService(repo);

    await expect(svc.update('course-1', row)).resolves.toEqual(row);

    repo.updateById = vi.fn().mockResolvedValue(null);
    await expect(svc.update('course-1', row)).rejects.toMatchObject({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: COURSE_ERROR.FAILED_TO_UPDATE_COURSE,
    });
  });

  it('delete throws when course missing', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
    const svc = new CourseService(repo);

    await expect(svc.delete('x')).rejects.toMatchObject({
      status: STATUS_CODE.NOT_FOUND,
      message: COURSE_ERROR.COURSE_NOT_FOUND,
    });
  });

  it('delete removes existing course', async () => {
    const row = courseResponce();
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(row),
      deleteById: vi.fn().mockResolvedValue(undefined),
    });
    const svc = new CourseService(repo);

    await svc.delete('course-1');
    expect(repo.deleteById).toHaveBeenCalledWith('course-1');
  });
});
