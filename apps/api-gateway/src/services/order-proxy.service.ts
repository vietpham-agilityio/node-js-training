import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

// Libs
import { HttpProxyService } from '@app/common';
import { ORDER_BASE_URL, API_ENDPOINT } from '@app/constants/shared/router/route';

// Module
import { CreateOrderDTO, UpdateOrderDTO } from 'apps/order/src/order.dto';
import { Order } from 'apps/order/src/order.entity';

@Injectable()
export class OrderProxyService extends HttpProxyService {
  protected readonly serviceName = 'Order';

  constructor(private readonly httpService: HttpService) {
    super();
  }

  createOrder(body: CreateOrderDTO, authorization?: string): Promise<Order> {
    return this.forward(
      this.httpService.post(
        `${ORDER_BASE_URL}${API_ENDPOINT.ORDER}`,
        body,
        this.withAuth(authorization),
      ),
    );
  }

  findAll(authorization?: string): Promise<Order[]> {
    return this.forward(
      this.httpService.get(
        `${ORDER_BASE_URL}${API_ENDPOINT.ORDER}`,
        this.withAuth(authorization),
      ),
    );
  }

  findOne(id: number, authorization?: string): Promise<Order> {
    return this.forward(
      this.httpService.get(
        `${ORDER_BASE_URL}${API_ENDPOINT.ORDER}/${id}`,
        this.withAuth(authorization),
      ),
    );
  }

  updateOrder(
    id: number,
    body: UpdateOrderDTO,
    authorization?: string,
  ): Promise<Order> {
    return this.forward(
      this.httpService.patch(
        `${ORDER_BASE_URL}${API_ENDPOINT.ORDER}/${id}`,
        body,
        this.withAuth(authorization),
      ),
    );
  }

  removeOrder(id: number, authorization?: string): Promise<Order> {
    return this.forward(
      this.httpService.delete(
        `${ORDER_BASE_URL}${API_ENDPOINT.ORDER}/${id}`,
        this.withAuth(authorization),
      ),
    );
  }
}
