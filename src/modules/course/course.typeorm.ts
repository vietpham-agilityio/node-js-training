import type { DataSource, Repository } from 'typeorm';

// Types
import type { APIResponse } from '@/types/response.ts';
import type {
  CourseRepository,
  Course,
} from '@/modules/course/course.repository.ts';

// Entity
import { CourseEntity } from '@/modules/course/course.entity.ts';

// Constants
import { COURSE_STATUS } from '@/constants/enum.ts';

export class CourseTypeORMRepository implements CourseRepository {
  private readonly repository: Repository<CourseEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(CourseEntity);
  }

  private mapToResponse({
    id,
    title,
    description,
    isFree,
    price,
    status,
    createdAt,
    updatedAt,
  }: CourseEntity): APIResponse<Course> {
    return {
      id: String(id),
      title: title,
      description: description,
      price: price,
      isFree: isFree,
      status: status as COURSE_STATUS,
      createdAt: createdAt,
      updatedAt: updatedAt,
    };
  }

  async findAllPublished(): Promise<APIResponse<Course>[]> {
    const publishedCourses = await this.repository.find({
      where: { status: COURSE_STATUS.PUBLISHED },
    });

    return publishedCourses.map(course => this.mapToResponse(course));
  }

  async create({
    title,
    description,
    isFree,
    price,
    status,
  }: Course): Promise<APIResponse<Course> | null> {
    const entity = this.repository.create({
      title: title,
      description: description,
      price: price,
      isFree: isFree,
      status: status,
    });

    const saved = await this.repository.save(entity);

    const loaded = await this.repository.findOne({ where: { id: saved.id } });

    return loaded ? this.mapToResponse(loaded) : null;
  }

  async findById(id: string): Promise<APIResponse<Course> | null> {
    const entity = await this.repository.findOne({
      where: { id: Number(id) },
    });

    return entity ? this.mapToResponse(entity) : null;
  }

  async findAll(): Promise<APIResponse<Course>[]> {
    const courses = await this.repository.find({
      order: { id: 'DESC' },
    });

    return courses.map(course => this.mapToResponse(course));
  }

  async updateById(
    id: string,
    course: Partial<Course>,
  ): Promise<APIResponse<Course> | null> {
    const entity = await this.repository.findOne({
      where: { id: Number(id) },
    });

    if (entity === null) return null;

    Object.assign(entity, course);

    await this.repository.save(entity);

    return this.findById(id);
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
