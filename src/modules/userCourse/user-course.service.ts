// Type
import type { UserCourseRepository } from "./user-course.repository.ts";
import type { UserCourseResponse } from "./user-course.repository.ts";

export class UserCourseService {
  constructor(private readonly userCourseRepository: UserCourseRepository) { }

  async grantCourseAccess(
    userId: string,
    courseId: number,
    stripeSessionId?: string | null,
  ): Promise<UserCourseResponse> {
    if (stripeSessionId) {
      const alreadyProcessed =
        await this.userCourseRepository.existsByStripeSessionId(
          stripeSessionId,
        );

      if (alreadyProcessed) {
        console.info(
          { stripeSessionId, userId, courseId },
          'user_course: stripe session already processed — skipping duplicate',
        );

        const userCourses =
          await this.userCourseRepository.findByUserId(userId);

        const course = userCourses.find(course => course.courseId === courseId);

        if (course) return course;
      }
    }

    const record = await this.userCourseRepository.grantCourseAccess(
      userId,
      courseId,
      stripeSessionId,
    );

    console.info(
      { userId, courseId, stripeSessionId },
      'user_course: access granted',
    );

    return record;
  }


  async listForUser(userId: string): Promise<readonly UserCourseResponse[]> {
    return this.userCourseRepository.findByUserId(userId);
  }
}
