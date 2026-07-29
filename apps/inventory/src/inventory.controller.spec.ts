import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './inventory-item.entity';

describe('InventoryController', () => {
  let inventoryController: InventoryController;

  beforeEach(async () => {
    const mockInventoryRepository = {
      count: jest.fn().mockResolvedValue(1),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      save: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        InventoryService,
        { provide: 'ORDER_SERVICE', useValue: { emit: jest.fn() } },
        {
          provide: getRepositoryToken(InventoryItem),
          useValue: mockInventoryRepository,
        },
      ],
    }).compile();

    inventoryController = app.get<InventoryController>(InventoryController);
  });

  describe('health', () => {
    it('should return status UP', () => {
      expect(inventoryController.checkHealth()).toEqual({ status: 'UP' });
    });
  });
});
