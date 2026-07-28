import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { CreateUserDTO } from './user.dto';

describe('UsersService', () => {
  const newUser: CreateUserDTO = {
    firstName: 'Kitoko',
    lastName: 'Mwana',
    phoneNumber: '0897278983',
    email: 'example@gmail.com',
    address: '1234, Lubumbashi, DRC',
  };

  let service: UserService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
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
