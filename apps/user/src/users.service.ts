import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { UserCredentialsShape } from '@app/constants';

const PASSWORD_SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(user: CreateUserDTO): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(user.password, PASSWORD_SALT_ROUNDS);
    const newUser = this.userRepository.create({
      ...user,
      password: hashedPassword,
    });
    const saved = await this.userRepository.save(newUser);
    return this.stripPassword(saved);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.userRepository.find();
    return users;
  }

  async findById(userId: number): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async update(userId: number, user: UpdateUserDTO): Promise<UserEntity> {
    const existing = await this.findById(userId);
    const { password, ...rest } = user;

    const updated = this.userRepository.merge(
      existing,
      rest,
      password ? { password: await bcrypt.hash(password, PASSWORD_SALT_ROUNDS) } : {},
    );
    const saved = await this.userRepository.save(updated);
    return this.stripPassword(saved);
  }

  async remove(userId: number): Promise<void> {
    const result = await this.userRepository.delete(userId);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserCredentialsShape> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return { id: user.id, email: user.email, role: user.role! };
  }

  private stripPassword(user: UserEntity): UserEntity {
    const { password: _password, ...rest } = user;
    return rest as UserEntity;
  }
}
