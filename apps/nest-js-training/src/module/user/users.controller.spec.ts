import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { UserEntity } from './user.entity';

describe('UserController', () => {
    let controller: UserController;
    let service: jest.Mocked<UserService>;

    const mockUser: UserEntity = {
        id: 1,
        firstName: 'Kitoko',
        lastName: 'Mwana',
        phoneNumber: '0897278983',
        email: 'user@gmail.com',
        address: '1234, Lubumbashi, DRC',
    };

    beforeEach(async () => {
        const mockUserService = {
            findAll: jest.fn(),
            findAllV2: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        service = module.get(UserService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll (v1)', () => {
        it('should return an array of users', async () => {
            service.findAll.mockResolvedValue([mockUser]);

            const result = await controller.findAll();

            expect(result).toEqual([mockUser]);
            expect(service.findAll).toHaveBeenCalledTimes(1);
            expect(service.findAll).toHaveBeenCalledWith();
        });

        it('should return an empty array when no users exist', async () => {
            service.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('create', () => {
        it('should create a new user and return it', async () => {
            const createUserDto = {
                firstName: 'Kitoko',
                lastName: 'Mwana',
                phoneNumber: '0897278983',
                email: 'user@gmail.com',
                address: '1234, Lubumbashi, DRC',
            };
            service.create.mockResolvedValue(mockUser);

            const result = await controller.create(createUserDto as any);

            expect(result).toEqual(mockUser);
            expect(service.create).toHaveBeenCalledTimes(1);
            expect(service.create).toHaveBeenCalledWith(createUserDto);
        });
    });

    describe('update', () => {
        it('should update an existing user and return it', async () => {
            const updateUserDto = { firstName: 'Updated' };
            const updatedUser = { ...mockUser, firstName: 'Updated' };
            service.update.mockResolvedValue(updatedUser);

            const result = await controller.update(1, updateUserDto as any);

            expect(result).toEqual(updatedUser);
            expect(service.update).toHaveBeenCalledTimes(1);
            expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
        });

        it('should pass the parsed numeric userId through to the service', async () => {
            service.update.mockResolvedValue(mockUser);

            await controller.update(42, {} as any);

            expect(service.update).toHaveBeenCalledWith(42, {});
        });
    });

    describe('remove', () => {
        it('should call service.remove with the given userId', async () => {
            service.remove.mockResolvedValue(undefined);

            const result = await controller.remove(1);

            expect(result).toBeUndefined();
            expect(service.remove).toHaveBeenCalledTimes(1);
            expect(service.remove).toHaveBeenCalledWith(1);
        });
    });
});
