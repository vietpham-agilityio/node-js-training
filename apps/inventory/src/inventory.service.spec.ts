import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './inventory-item.entity';

describe('InventoryService', () => {
  let service: InventoryService;
  let mockRepository: {
    count: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    mockRepository = {
      count: jest.fn().mockResolvedValue(1),
      findOne: jest.fn(),
      save: jest.fn((item: InventoryItem) => Promise.resolve(item)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: 'ORDER_SERVICE', useValue: { emit: jest.fn() } },
        {
          provide: getRepositoryToken(InventoryItem),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  describe('updateStock', () => {
    it('updates the quantity of an existing item', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Laptop',
        quantity: 100,
      });

      const result = await service.updateStock(1, 25);

      expect(result.quantity).toBe(25);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, quantity: 25 }),
      );
    });

    it('throws NotFoundException when the product does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStock(999, 10)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
