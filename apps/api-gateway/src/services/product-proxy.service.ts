import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map, Observable } from 'rxjs';

// Common
import { HttpProxyService } from '@app/common';

// Constants
import { PRODUCT_BASE_URL, API_ENDPOINT } from '@app/constants/shared/router/route';
import { CreateProductDTO, UpdateProductDTO } from 'apps/product/src/product.dto';

// Entities
import { ProductEntity } from 'apps/product/src/product.entity';

@Injectable()
export class ProductProxyService extends HttpProxyService {
  protected readonly serviceName = 'Product';

  constructor(private readonly httpService: HttpService) {
    super();
  }

  create(body: CreateProductDTO, authorization?: string): Promise<ProductEntity> {
    return this.forward(
      this.httpService.post(
        `${PRODUCT_BASE_URL}${API_ENDPOINT.PRODUCT}`,
        body,
        this.withAuth(authorization),
      ),
    );
  }

  findAll(authorization?: string): Promise<ProductEntity[]> {
    return this.forward(
      this.httpService.get(
        `${PRODUCT_BASE_URL}${API_ENDPOINT.PRODUCT}`,
        this.withAuth(authorization),
      ),
    );
  }

  findOne(id: number, authorization?: string): Promise<ProductEntity> {
    return this.forward(
      this.httpService.get(
        `${PRODUCT_BASE_URL}${API_ENDPOINT.PRODUCT}/${id}`,
        this.withAuth(authorization),
      ),
    );
  }

  update(
    id: number,
    body: UpdateProductDTO,
    authorization?: string,
  ): Promise<ProductEntity> {
    return this.forward(
      this.httpService.patch(
        `${PRODUCT_BASE_URL}${API_ENDPOINT.PRODUCT}/${id}`,
        body,
        this.withAuth(authorization),
      ),
    );
  }

  remove(id: number, authorization?: string): Promise<void> {
    return this.forward(
      this.httpService.delete(
        `${PRODUCT_BASE_URL}${API_ENDPOINT.PRODUCT}/${id}`,
        this.withAuth(authorization),
      ),
    );
  }

  private withAuth(authorization?: string): { headers?: Record<string, string> } {
    return authorization ? { headers: { Authorization: authorization } } : {};
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
}
