import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
  let inventoryController: InventoryController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        InventoryService,
        { provide: 'ORDER_SERVICE', useValue: { emit: jest.fn() } },
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
