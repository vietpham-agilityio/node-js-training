export interface UserCourseResponse {
  id: number;
  userId: string;
  courseId: number;
  stripeSessionId: string | null;
  grantedAt: string;
}

export interface UserCourseRepository {
  grantCourseAccess(
    userId: string,
    courseId: number,
    stripeSessionId?: string | null,
  ): Promise<UserCourseResponse>;

  existsByStripeSessionId(stripeSessionId: string): Promise<boolean>;

  findByUserId(userId: string): Promise<readonly UserCourseResponse[]>;
}
