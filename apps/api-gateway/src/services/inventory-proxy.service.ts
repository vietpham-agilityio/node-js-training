import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { extractRpcErrorMessage } from '@app/common';
import { INVENTORY_MESSAGES, type InventoryItemShape } from '@app/constants';

@Injectable()
export class InventoryProxyService {
  constructor(
    @Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy,
  ) {}

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

  private toHttpException(error: unknown): HttpException {
    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? (error as { status?: number }).status
        : undefined;

    if (status === HttpStatus.NOT_FOUND) {
      return new HttpException(
        extractRpcErrorMessage(error, 'Not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    return new HttpException(
      extractRpcErrorMessage(error, 'Inventory service unavailable'),
      HttpStatus.BAD_GATEWAY,
    );
  }
}
