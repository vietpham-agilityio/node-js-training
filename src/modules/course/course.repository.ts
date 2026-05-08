// Types
import { BaseRepository } from '@/types/repository.ts';
import type { APIResponse } from '@/types/response.ts';

// Constants
import { COURSE_STATUS } from '@/constants/enum.ts';

export interface Course {
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  status: COURSE_STATUS;
}

export interface CourseRepository extends BaseRepository<
  APIResponse<Course>,
  Course
> {
  /** Get all published courses. */
  findAllPublished(): Promise<APIResponse<Course>[]>;
}
