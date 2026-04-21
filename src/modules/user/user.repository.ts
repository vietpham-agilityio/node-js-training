import type { APIResponse } from "@/types/response.ts";

import { USER_ROLE } from "@/constants/enum.ts";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: USER_ROLE;
}

export type UserCreateInput = Omit<User, 'role'>;

export interface UserRepository {
  /** Get user by Clerk ID. */
  getById(id: string): Promise<APIResponse<User> | null>;

  /** Update user by Clerk ID. */
  updateById(id: string, user: Partial<User>): Promise<APIResponse<User> | null>;

  /** Create user from Clerk webhook payload. */
  create(data: UserCreateInput): Promise<APIResponse<User>>;

  /** Get all users. */
  findAll(): Promise<APIResponse<User>[]>;

  /** Delete user by Clerk ID. */
  delete(id: string): Promise<void>;
}
