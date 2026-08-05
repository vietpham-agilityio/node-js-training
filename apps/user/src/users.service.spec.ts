import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDTO } from './user.dto';
import { UserEntity } from './user.entity';
import { USER_ROLE } from '@app/constants';

describe('UsersService', () => {
  const newUser: CreateUserDTO = {
    firstName: 'Kitoko',
    lastName: 'Mwana',
    phoneNumber: '0897278983',
    email: 'example@gmail.com',
    address: '1234, Lubumbashi, DRC',
    password: 'good_user@123',
  };

  const seedUsers: UserEntity[] = [
    {
      id: 1,
      firstName: 'Alice',
      lastName: 'Anderson',
      email: 'alice@example.com',
      phoneNumber: '0939997738',
      address: '1 Independence Ave, Kinshasa, DRC',
      password: bcrypt.hashSync('good_user@123', 10),
      role: USER_ROLE.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      firstName: 'Bob',
      lastName: 'Baker',
      email: 'bob@example.com',
      phoneNumber: '0911111111',
      address: '2 Liberation Rd, Lubumbashi, DRC',
      password: 'good_user@123',
      role: USER_ROLE.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  let service: UserService;
  let users: UserEntity[];
  let mockRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOneBy: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  beforeEach(async () => {
    users = seedUsers.map((user) => ({ ...user }));

    mockRepository = {
      create: jest.fn((dto: CreateUserDTO) => ({ ...dto }) as UserEntity),
      save: jest.fn((user: UserEntity) => {
        const saved: UserEntity = {
          ...user,
          id: users.length + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        users.push(saved);
        return Promise.resolve(saved);
      }),
      find: jest.fn(() => Promise.resolve(users)),
      findOneBy: jest.fn(({ email }: { email: string }) =>
        Promise.resolve(users.find((u) => u.email === email)),
      ),
      createQueryBuilder: jest.fn(() => {
        let emailFilter: string | undefined;
        const builder = {
          addSelect: jest.fn(() => builder),
          where: jest.fn((_clause: string, params: { email: string }) => {
            emailFilter = params.email;
            return builder;
          }),
          getOne: jest.fn(() =>
            Promise.resolve(users.find((u) => u.email === emailFilter)),
          ),
        };
        return builder;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: mockRepository },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn(), mdel: jest.fn() },
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const user = await service.create(newUser);
    expect(user).toBeDefined();
    expect(user.firstName).toBe(newUser.firstName);
    expect(user.lastName).toBe(newUser.lastName);
    expect(user.phoneNumber).toBe(newUser.phoneNumber);
    expect(user.address).toBe(newUser.address);
  });

  it('rejects registering a second account with an already-used email', async () => {
    await expect(
      service.create({ ...newUser, email: 'alice@example.com' }),
    ).rejects.toThrow(ConflictException);

    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should hash the password before persisting it, and never return it', async () => {
    const user = await service.create(newUser);
    expect(user.password).toBeUndefined();

    const persisted = mockRepository.save.mock.calls[0][0] as UserEntity;
    expect(persisted.password).not.toBe(newUser.password);
    await expect(
      bcrypt.compare(newUser.password, persisted.password),
    ).resolves.toBe(true);
  });

  it('should return an array of users', async () => {
    const users = await service.findAll();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0].firstName).toBeDefined();
    expect(users[0].phoneNumber).toBe('0939997738');
    expect(users[1].address).toBeDefined();
  });

  describe('validateCredentials', () => {
    it('returns the sanitized user shape for correct credentials', async () => {
      const result = await service.validateCredentials(
        'alice@example.com',
        'good_user@123',
      );

      expect(result).toEqual({
        id: 1,
        email: 'alice@example.com',
        role: USER_ROLE.USER,
      });
    });

    it('throws UnauthorizedException for an unknown email', async () => {
      await expect(
        service.validateCredentials('nobody@example.com', 'good_user@123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for a wrong password', async () => {
      await expect(
        service.validateCredentials('alice@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
