import { getAuth } from '@clerk/express';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

// Constants
import { USER_ROLE } from '@/constants/enum.ts';
import { STATUS_CODE } from '@/constants/status-code.ts';

// Services
import type { UserService } from '@/modules/user/user.service.js';
import { AUTH_ERROR, USER_ERROR } from '@/constants/error-messages.ts';

export const createRequireAdmin = (
  userService: UserService,
): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(STATUS_CODE.UNAUTHORIZED).json({
        error: AUTH_ERROR.AUTH_TOKEN_REQUIRED,
      });

      return;
    }

    const user = await userService.findById(userId);

    if (user === null) {
      res.status(STATUS_CODE.NOT_FOUND).json({
        error: USER_ERROR.USER_NOT_FOUND,
      });

      return;
    }

    if (user.role !== USER_ROLE.ADMIN) {
      res.status(STATUS_CODE.FORBIDDEN).json({
        error: AUTH_ERROR.ADMIN_REQUIRED,
      });

      return;
    }

    next();
  };
};
