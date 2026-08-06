import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { InventoryProxyService } from '../';

describe('InventoryProxyService', () => {
  let service: InventoryProxyService;
  let inventoryClient: jest.Mocked<Pick<ClientProxy, 'send'>>;

  beforeEach(async () => {
    const mockInventoryClient = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryProxyService,
        { provide: 'INVENTORY_SERVICE', useValue: mockInventoryClient },
      ],
    }).compile();

    service = module.get<InventoryProxyService>(InventoryProxyService);
    inventoryClient = module.get('INVENTORY_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStock', () => {
    it('sends the update-stock message and returns the response', async () => {
      inventoryClient.send.mockReturnValue(
        of({ id: 1, name: 'Laptop', quantity: 25 }),
      );

      const result = await service.updateStock(1, 25);

      expect(result).toEqual({ id: 1, name: 'Laptop', quantity: 25 });
      expect(inventoryClient.send).toHaveBeenCalledWith(
        'inventory_update_stock',
        { productId: 1, quantity: 25 },
      );
    });

    it('maps a not-found error into a 404 HttpException', async () => {
      inventoryClient.send.mockReturnValue(
        throwError(() => ({
          status: HttpStatus.NOT_FOUND,
          message: 'Product 999 not found in inventory',
        })),
      );

      await expect(service.updateStock(999, 10)).rejects.toMatchObject({
        message: 'Product 999 not found in inventory',
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('maps an unrecognized error into a 502', async () => {
      inventoryClient.send.mockReturnValue(throwError(() => new Error('boom')));

      await expect(service.updateStock(1, 10)).rejects.toMatchObject({
        status: HttpStatus.BAD_GATEWAY,
      });
    });

    it('maps a connection-refused error (empty message) into a 502 with a meaningful message', async () => {
      inventoryClient.send.mockReturnValue(
        throwError(() => ({ code: 'ECONNREFUSED', message: '' })),
      );

      await expect(service.updateStock(1, 10)).rejects.toMatchObject({
        status: HttpStatus.BAD_GATEWAY,
        message: 'Inventory service unavailable (ECONNREFUSED)',
      });
    });

    it('does not trust a non-404 status from the inventory service and maps it to a 502', async () => {
      inventoryClient.send.mockReturnValue(
        throwError(() => ({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'inventory db exploded',
        })),
      );

      await expect(service.updateStock(1, 10)).rejects.toMatchObject({
        status: HttpStatus.BAD_GATEWAY,
        message: 'inventory db exploded',
      });
    });
  });
});
