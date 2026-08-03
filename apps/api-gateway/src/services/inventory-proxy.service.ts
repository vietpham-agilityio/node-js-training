import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';

// Common
import { TCPProxyService } from '@app/common';

// Constants
import { INVENTORY_MESSAGES, type InventoryItemShape } from '@app/constants';

@Injectable()
export class InventoryProxyService extends TCPProxyService {
  protected readonly unavailableMessage = 'Inventory service unavailable';

  constructor(
    @Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy,
  ) {
    super();
  }

  updateStock(
    productId: number,
    quantity: number,
  ): Promise<InventoryItemShape> {
    return firstValueFrom(
      this.inventoryClient
        .send<InventoryItemShape>(INVENTORY_MESSAGES.UPDATE_STOCK, {
          productId,
          quantity,
        })
        .pipe(
          catchError((err: unknown) => {
            throw this.toHttpException(err);
          }),
        ),
    );
  }

  protected acceptStatus(status: number): boolean {
    return status === HttpStatus.NOT_FOUND;
  }

  protected statusFallbackMessage(): string {
    return 'Item Not found';
  }
}
