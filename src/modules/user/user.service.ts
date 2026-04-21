// Constants
import { USER_ROLE } from '@/constants/enum.js';
import { STATUS_CODE } from '@/constants/status-code.ts';
import { USER_ERROR } from '@/constants/error-messages.ts';

// Error
import { AppError } from '@/types/error.ts';

// Types
import type { APIResponse } from '@/types/response.ts';
import type { UserCreateInput } from '@/modules/user/user.repository.ts';
import type { User, UserRepository } from '@/modules/user/user.repository.ts';

export class UserService {
  constructor(private readonly userRepository: UserRepository) { }

  async create(input: UserCreateInput): Promise<APIResponse<User>> {
    const result = await this.userRepository.create(input);

    if (result === null) {
      throw new AppError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        USER_ERROR.FAILED_TO_CREATE_USER,
      );
    }

    return result;
  }

  async syncUserProfile(input: UserCreateInput): Promise<APIResponse<User>> {
    const { id, email, firstName, lastName } = input;

    const existing = await this.findById(id);

    if (existing !== null) {
      const updated = await this.userRepository.updateById(id, {
        email,
        firstName,
        lastName,
      });

      if (updated === null) {
        throw new AppError(
          STATUS_CODE.INTERNAL_SERVER_ERROR,
          USER_ERROR.FAILED_TO_UPDATE_USER,
        );
      }

      return updated;
    }

    return this.create(input);
  }

  async findAll(): Promise<APIResponse<User>[]> {
    const listUsers = await this.userRepository.findAll();

    if (listUsers === null) {
      throw new AppError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        USER_ERROR.FAILED_TO_GET_ALL_USERS,
      );
    }

    return listUsers;
  }

  async findById(id: string): Promise<APIResponse<User>> {
    const user = await this.userRepository.getById(id);

    if (user === null) {
      throw new AppError(STATUS_CODE.NOT_FOUND, USER_ERROR.USER_NOT_FOUND);
    }

    return user;
  }

  async promoteUserToAdmin(id: string): Promise<APIResponse<User>> {
    const existing = await this.findById(id);

    if (existing!.role === USER_ROLE.ADMIN) {
      throw new AppError(
        STATUS_CODE.CONFLICT,
        USER_ERROR.USER_ALREADY_ADMIN,
      );
    }

    const updated = await this.userRepository.updateById(id, {
      role: USER_ROLE.ADMIN,
    });

    if (updated === null) {
      throw new AppError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        USER_ERROR.FAILED_TO_UPDATE_USER,
      );
    }

    return updated;
  }

  async deleteUserById(id: string): Promise<void> {
    await this.findById(id);
    await this.userRepository.delete(id);
  }
}
