import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ClientProxy,
  ClientProxyFactory,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ORDER_EVENTS, INVENTORY_MESSAGES } from '@app/constants';
import { InventoryModule } from './../src/inventory.module';
import { InventoryItem } from './../src/inventory-item.entity';

const TEST_TCP_PORT = 8092;

async function waitFor(
  predicate: () => boolean,
  timeoutMs = 2000,
  intervalMs = 25,
): Promise<void> {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('Timed out waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

describe('Inventory (e2e)', () => {
  let app: INestApplication;
  let client: ClientProxy;
  let repository: Repository<InventoryItem>;
  let orderClientEmit: jest.Mock;
  let testItem: InventoryItem;

  beforeAll(async () => {
    orderClientEmit = jest.fn();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [InventoryModule],
    })
      .overrideProvider('ORDER_SERVICE')
      .useValue({ emit: orderClientEmit })
      .compile();

    app = moduleFixture.createNestApplication();
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.TCP,
      options: { port: TEST_TCP_PORT },
    });
    await app.startAllMicroservices();
    await app.init();

    repository = app.get(getRepositoryToken(InventoryItem));
    testItem = await repository.save(
      repository.create({ name: 'E2E Test Widget', quantity: 20 }),
    );

    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { port: TEST_TCP_PORT },
    });
    await client.connect();
  });

  afterAll(async () => {
    await repository.delete(testItem.id);
    client.close();
    await app.close();
  });

  beforeEach(() => {
    orderClientEmit.mockClear();
  });

  describe('inventory_update_stock message pattern', () => {
    it('updates stock for an existing item over TCP', async () => {
      const result = await firstValueFrom(
        client.send<InventoryItem>(INVENTORY_MESSAGES.UPDATE_STOCK, {
          productId: testItem.id,
          quantity: 42,
        }),
      );

      expect(result).toMatchObject({ id: testItem.id, quantity: 42 });
    });

    it('rejects when the product does not exist', async () => {
      await expect(
        firstValueFrom(
          client.send(INVENTORY_MESSAGES.UPDATE_STOCK, {
            productId: 999999999,
            quantity: 1,
          }),
        ),
      ).rejects.toBeDefined();
    });
  });

  describe('order_created event pattern', () => {
    it('decrements stock and reports success when quantity is sufficient', async () => {
      await firstValueFrom(
        client.send<InventoryItem>(INVENTORY_MESSAGES.UPDATE_STOCK, {
          productId: testItem.id,
          quantity: 20,
        }),
      );

      client
        .emit(ORDER_EVENTS.ORDER_CREATED, {
          id: 501,
          name: 'E2E Order',
          productId: testItem.id,
          price: 1000,
          quantity: 15,
        })
        .subscribe();

      await waitFor(() => orderClientEmit.mock.calls.length > 0);

      expect(orderClientEmit).toHaveBeenCalledWith(
        ORDER_EVENTS.ORDER_PROCESSED,
        expect.objectContaining({ orderId: 501, success: true }),
      );
    });

    it('reports failure when the remaining quantity is insufficient', async () => {
      // Depends on the previous test having brought the item down to 5.
      client
        .emit(ORDER_EVENTS.ORDER_CREATED, {
          id: 502,
          name: 'E2E Order 2',
          productId: testItem.id,
          price: 1000,
          quantity: 999,
        })
        .subscribe();

      await waitFor(() => orderClientEmit.mock.calls.length > 0);

      expect(orderClientEmit).toHaveBeenCalledWith(
        ORDER_EVENTS.ORDER_PROCESSED,
        expect.objectContaining({ orderId: 502, success: false }),
      );
    });

    it('reports failure when the product is not found', async () => {
      client
        .emit(ORDER_EVENTS.ORDER_CREATED, {
          id: 503,
          name: 'E2E Order 3',
          productId: 999999999,
          price: 1000,
          quantity: 1,
        })
        .subscribe();

      await waitFor(() => orderClientEmit.mock.calls.length > 0);

      expect(orderClientEmit).toHaveBeenCalledWith(
        ORDER_EVENTS.ORDER_PROCESSED,
        expect.objectContaining({ orderId: 503, success: false }),
      );
    });
  });
});
