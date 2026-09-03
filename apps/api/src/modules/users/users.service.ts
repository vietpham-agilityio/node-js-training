import * as bcrypt from 'bcrypt';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { BaseAbstractService } from '../../common/base/base-crud.service';
import type { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import type { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/exceptions/error-codes';
import { BCRYPT_SALT_ROUNDS } from '../auth/constants/auth.constants';
import type { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import type { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService extends BaseAbstractService<User> {
  constructor(@InjectRepository(User) repository: Repository<User>) {
    super(repository, 'User');
  }

  async getProfile(id: string): Promise<UserResponseDto> {
    return this.excludeSensitiveResponse(await this.findOne(id));
  }

  async updateProfile(
    id: string,
    data: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.excludeSensitiveResponse(await this.update(id, data));
  }

  async changePassword(
    id: string,
    { currentPassword, newPassword }: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.findOne(id);
    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      throw new AppException(
        ErrorCode.INVALID_CREDENTIALS,
        'Current password is incorrect',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await this.repository.update(user.id, { passwordHash });
  }

  async findAllUsers(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { data, meta } = await this.findAll(query);
    return {
      data: data.map((user) => this.excludeSensitiveResponse(user)),
      meta,
    };
  }

  async updateByAdmin(
    adminId: string,
    id: string,
    data: AdminUpdateUserDto,
  ): Promise<UserResponseDto> {
    this.assertNotSelf(adminId, id);
    return this.excludeSensitiveResponse(await this.update(id, data));
  }

  // Implements BaseAbstractService's abstract remove() — ADR-010: soft
  // delete, not a real DELETE.
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.repository.update(user.id, { isActive: false });
  }

  async removeByAdmin(adminId: string, id: string): Promise<void> {
    this.assertNotSelf(adminId, id);
    await this.remove(id);
  }

  private assertNotSelf(adminId: string, targetId: string): void {
    if (adminId === targetId) {
      throw new AppException(
        ErrorCode.ADMIN_SELF_ACTION_FORBIDDEN,
        'An admin cannot change their own role or active status through this endpoint',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private excludeSensitiveResponse({
    id,
    email,
    firstName,
    lastName,
    phoneNumber,
    dateOfBirth,
    address,
    avatarUrl,
    role,
    isActive,
    createdAt,
    updatedAt,
  }: User): UserResponseDto {
    return {
      id,
      email,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      address,
      avatarUrl,
      role,
      isActive,
      createdAt,
      updatedAt,
    };
  }
}
