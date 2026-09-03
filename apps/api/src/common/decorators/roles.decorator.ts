import { SetMetadata } from '@nestjs/common';

import { UserRole } from '../../modules/users/enums/user-role.enum';

export const ROLES_KEY = 'roles';

// ADR-006: opts a route into role checking. Read by RolesGuard.
export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
