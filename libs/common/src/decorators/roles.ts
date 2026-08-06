import { SetMetadata } from '@nestjs/common';

// Libs
import type { USER_ROLE } from '@app/constants';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: USER_ROLE[]) => SetMetadata(ROLES_KEY, roles);
