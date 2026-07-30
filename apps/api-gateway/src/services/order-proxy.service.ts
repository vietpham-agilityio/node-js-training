import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map, Observable } from 'rxjs';
import { ORDER_BASE_URL, API_ENDPOINT } from '@app/constants/shared/router/route';
import { CreateOrderDTO, UpdateOrderDTO } from 'apps/order/src/order.dto';
import { Order } from 'apps/order/src/order.entity';

@Injectable()
export class OrderProxyService {
  constructor(private readonly httpService: HttpService) { }

  createOrder(body: CreateOrderDTO): Promise<Order> {
    return this.forward(
      this.httpService.post(`${ORDER_BASE_URL}${API_ENDPOINT.ORDER}`, body),
    );
  }

  findAll(): Promise<Order[]> {
    return this.forward(this.httpService.get(`${ORDER_BASE_URL}${API_ENDPOINT.ORDER}`));
  }

  findOne(id: number): Promise<Order> {
    return this.forward(this.httpService.get(`${ORDER_BASE_URL}${API_ENDPOINT.ORDER}/${id}`));
  }

  updateOrder(id: number, body: UpdateOrderDTO): Promise<Order> {
    return this.forward(
      this.httpService.patch(`${ORDER_BASE_URL}${API_ENDPOINT.ORDER}/${id}`, body),
    );
  }

  removeOrder(id: number): Promise<Order> {
    return this.forward(
      this.httpService.delete(`${ORDER_BASE_URL}${API_ENDPOINT.ORDER}/${id}`),
    );
  }

  private forward<T>(obs: Observable<{ data: T }>): Promise<T> {
    return firstValueFrom(
      obs.pipe(
        map((res) => res.data),
        catchError((err: unknown) => {
          throw this.toHttpException(err);
        }),
      ),
    );
  }

  private toHttpException(error: unknown): HttpException {
    if (
      typeof error === 'object' &&
      error !== null &&
      (error as { isAxiosError?: boolean }).isAxiosError
    ) {
      const { response } = error as {
        response?: { status: number; data: unknown };
      };
      if (response) {
        const { status, data } = response;
        const message =
          typeof data === 'object' && data !== null && 'message' in data
            ? (data as { message: string | string[] }).message
            : 'Order service error';
        return new HttpException({ message }, status);
      }
      return new HttpException(
        'Order service unavailable',
        HttpStatus.BAD_GATEWAY,
      );
    }
    return new HttpException(
      'Unexpected error calling order service',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
