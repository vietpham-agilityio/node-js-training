import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface';

// BR-34: ownership checks must use the authenticated user id, never a
// client-supplied one. This is how service code gets it.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const { user } = ctx
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedUser }>();
    return user;
  },
);
