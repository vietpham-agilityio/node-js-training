import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import type { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UserRole } from '../../modules/users/enums/user-role.enum';

// ADR-006: paired with @Roles() and applied after JwtAuthGuard, so
// request.user is already populated. No @Roles() metadata means any
// authenticated user may proceed.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedUser }>();

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role for this action');
    }

    return true;
  }
}
