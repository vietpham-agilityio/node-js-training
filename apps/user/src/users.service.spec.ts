import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { CreateUserDTO } from './user.dto';
import { UserEntity, USER_ROLE } from './user.entity';

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
      password: 'good_user@123',
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

  beforeEach(async () => {
    users = seedUsers.map((user) => ({ ...user }));

    const mockRepository = {
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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: mockRepository },
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

  it('should return an array of users', async () => {
    const users = await service.findAll();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0].firstName).toBeDefined();
    expect(users[0].phoneNumber).toBe('0939997738');
    expect(users[1].address).toBeDefined();
  });
});
