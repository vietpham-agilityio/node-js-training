// Errors
import { AppError } from '@/types/error.ts';

// Constants
import { COURSE_STATUS } from '@/constants/enum.ts';
import { STATUS_CODE } from '@/constants/status-code.ts';
import { COURSE_ERROR } from '@/constants/error-messages.ts';

// Types
import type { CourseRepository } from '@/modules/course/course.repository.ts';
import type { Course } from '@/modules/course/course.repository.ts';
import { APIResponse } from '@/types/response.ts';

export class CourseService {
  constructor(private courseRepository: CourseRepository) {}

  async create(course: Course): Promise<APIResponse<Course>> {
    const result = await this.courseRepository.create(course);

    if (result === null) {
      throw new AppError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        COURSE_ERROR.FAILED_TO_CREATE_COURSE,
      );
    }

    return result;
  }

  async findAll(): Promise<APIResponse<Course>[]> {
    const courses = await this.courseRepository.findAllPublished();

    if (courses === null) {
      throw new AppError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        COURSE_ERROR.FAILED_TO_GET_ALL_COURSES,
      );
    }

    return courses;
  }

  async findAllForAdmin(): Promise<APIResponse<Course>[]> {
    return await this.courseRepository.findAll();
  }

  async findById(id: string): Promise<APIResponse<Course>> {
    const course = await this.courseRepository.findById(id);

    if (course === null) {
      throw new AppError(STATUS_CODE.NOT_FOUND, COURSE_ERROR.COURSE_NOT_FOUND);
    }

    return course;
  }

  async findPublishedById(id: string): Promise<APIResponse<Course>> {
    const course = await this.courseRepository.findById(id);

    if (course === null || course.status !== COURSE_STATUS.PUBLISHED) {
      throw new AppError(STATUS_CODE.NOT_FOUND, COURSE_ERROR.COURSE_NOT_FOUND);
    }

    return course;
  }

  async update(id: string, course: Course): Promise<APIResponse<Course>> {
    const updated = await this.courseRepository.updateById(id, course);

    if (updated === null) {
      throw new AppError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        COURSE_ERROR.FAILED_TO_UPDATE_COURSE,
      );
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const exists = await this.courseRepository.findById(id);

    if (exists === null) {
      throw new AppError(STATUS_CODE.NOT_FOUND, COURSE_ERROR.COURSE_NOT_FOUND);
    }

    await this.courseRepository.deleteById(id);
  }
}
