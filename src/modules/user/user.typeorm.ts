import type { DataSource, Repository } from 'typeorm';

// Type
import type {
  UserRepository,
  UserCreateInput,
  User,
} from './user.repository.ts';
import type { APIResponse } from '@/types/response.ts';

// Entities
import { UserEntity } from './user.entity.ts';

// Constants
import { USER_ROLE } from '@/constants/enum.ts';

export class UserTypeORMRepository implements UserRepository {
  private readonly repository: Repository<UserEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserEntity);
  }

  private mapToResponse(entity: UserEntity): APIResponse<User> {
    return {
      id: entity.id,
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      role: entity.role as USER_ROLE,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  async findById(id: string): Promise<APIResponse<User> | null> {
    const user = await this.repository.findOne({ where: { id } });

    return user ? this.mapToResponse(user) : null;
  }

  async updateById(
    id: string,
    user: Partial<User>,
  ): Promise<APIResponse<User> | null> {
    const entity = await this.repository.findOne({ where: { id } });

    if (!entity) return null;

    Object.assign(entity, user);

    const savedUser = await this.repository.save(entity);

    return this.mapToResponse(savedUser);
  }

  async create(data: UserCreateInput): Promise<APIResponse<User>> {
    const entity = this.repository.create({
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    } as UserEntity);

    const savedUser = await this.repository.save(entity);

    return this.mapToResponse(savedUser);
  }

  async findAll(): Promise<APIResponse<User>[]> {
    const users = await this.repository.find();

    return users.map(user => this.mapToResponse(user));
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
