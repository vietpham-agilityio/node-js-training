 import type { DataSource, Repository } from 'typeorm';

// Types
import type { UserCourseRepository } from './user-course.repository.ts';
import type { UserCourseResponse } from './user-course.repository.ts';

// Entities
import { UserCourseEntity } from './user-course.entity.ts';

export class UserCourseTypeORMRepository implements UserCourseRepository {
  private readonly repository: Repository<UserCourseEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserCourseEntity);
  }

  private mapToResponse({
    id,
    userId,
    courseId,
    stripeSessionId,
    grantedAt,
  }: UserCourseEntity): UserCourseResponse {
    return {
      id: id,
      userId: userId,
      courseId: courseId,
      stripeSessionId: stripeSessionId ?? null,
      grantedAt: grantedAt.toISOString(),
    };
  }

  private async createUserCourse(
    userId: string,
    courseId: number,
    stripeSessionId: string | null,
  ): Promise<UserCourseEntity> {
    const entity = this.repository.create({
      user: { id: userId },
      course: { id: courseId },
      stripeSessionId: stripeSessionId ?? null,
    });

    return this.repository.save(entity);
  }

  async grantCourseAccess(
    userId: string,
    courseId: number,
    stripeSessionId: string | null,
  ): Promise<UserCourseResponse> {
    const existing = await this.repository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });

    if (existing) {
      return this.mapToResponse(existing);
    }

    const saved = await this.createUserCourse(
      userId,
      courseId,
      stripeSessionId,
    );

    return this.mapToResponse(saved);
  }

  async existsByStripeSessionId(stripeSessionId: string): Promise<boolean> {
    const count = await this.repository.count({ where: { stripeSessionId } });
    return count > 0;
  }

  async findByUserId(userId: string): Promise<readonly UserCourseResponse[]> {
    const rows = await this.repository.find({
      where: { user: { id: userId } },
      order: { grantedAt: 'DESC' },
    });

    return rows.map(row => this.mapToResponse(row));
  }
}
