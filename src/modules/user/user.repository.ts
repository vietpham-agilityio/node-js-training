// Types
import { BaseRepository } from '@/types/repository.ts';
import type { APIResponse } from '@/types/response.ts';

import { USER_ROLE } from '@/constants/enum.ts';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: USER_ROLE;
}

export type UserCreateInput = Omit<User, 'role'>;

export type UserRepository = BaseRepository<APIResponse<User>, UserCreateInput>;
