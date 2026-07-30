import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map, Observable } from 'rxjs';
import { PRODUCT_BASE_URL, API_ENDPOINT } from '@app/constants/shared/router/route';
import { CreateProductDTO, UpdateProductDTO } from 'apps/product/src/product.dto';
import { ProductEntity } from 'apps/product/src/product.entity';

@Injectable()
export class ProductProxyService {
  constructor(private readonly httpService: HttpService) { }

  create(body: CreateProductDTO): Promise<ProductEntity> {
    return this.forward(
      this.httpService.post(`${PRODUCT_BASE_URL}${API_ENDPOINT.PRODUCT}`, body),
    );
  }

  findAll(): Promise<ProductEntity[]> {
    return this.forward(
      this.httpService.get(`${PRODUCT_BASE_URL}${API_ENDPOINT.PRODUCT}`),
    );
  }

  findOne(id: number): Promise<ProductEntity> {
    return this.forward(
      this.httpService.get(`${PRODUCT_BASE_URL}${API_ENDPOINT.PRODUCT}/${id}`),
    );
  }

  update(id: number, body: UpdateProductDTO): Promise<ProductEntity> {
    return this.forward(
      this.httpService.patch(`${PRODUCT_BASE_URL}${API_ENDPOINT.PRODUCT}/${id}`, body),
    );
  }

  remove(id: number): Promise<void> {
    return this.forward(
      this.httpService.delete(`${PRODUCT_BASE_URL}${API_ENDPOINT.PRODUCT}/${id}`),
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
            : 'Product service error';

        return new HttpException({ message }, status);
      }

      return new HttpException(
        'Product service unavailable',
        HttpStatus.BAD_GATEWAY,
      );
    }

    return new HttpException(
      'Unexpected error calling product service',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
