import type { Request, Response } from 'express';
import { getAuth } from '@clerk/express';

// Constant
import { STATUS_CODE } from '@/constants/status-code.ts';
import { ERROR_MESSAGE_WITH_STATUS_CODE } from '@/constants/error-messages.ts';

// Type
import type { UserCourseService } from '@/modules/userCourse/user-course.service.ts';

export class UserCourseController {
  constructor(private readonly userCourseService: UserCourseService) { }

  getMyCourses = async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuth(req);

    if (!userId) {
      res
        .status(STATUS_CODE.UNAUTHORIZED)
        .json({ error: ERROR_MESSAGE_WITH_STATUS_CODE[STATUS_CODE.UNAUTHORIZED] });

      return;
    }

    const courses = await this.userCourseService.listForUser(userId);

    res.status(STATUS_CODE.OK).json(courses);
  };
}
