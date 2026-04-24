import { getAuth } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';

// Constants
import { STATUS_CODE } from '@/constants/status-code.ts';
import { AUTH_ERROR } from '@/constants/error-messages.ts';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(STATUS_CODE.UNAUTHORIZED).json({
      error: AUTH_ERROR.AUTH_TOKEN_REQUIRED,
    });

    return;
  }

  next();
};
