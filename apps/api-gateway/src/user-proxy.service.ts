import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map, Observable } from 'rxjs';
import { USER_BASE_URL, API_ENDPOINT } from '@app/constants/shared/router/route';
import { CreateUserDTO, UpdateUserDTO } from 'apps/user/src/user.dto';
import { UserEntity } from 'apps/user/src/user.entity';

@Injectable()
export class UserProxyService {
  constructor(private readonly httpService: HttpService) { }

  create(body: CreateUserDTO): Promise<UserEntity> {
    return this.forward(
      this.httpService.post(`${USER_BASE_URL}${API_ENDPOINT.USER}`, body),
    );
  }

  findAll(): Promise<UserEntity[]> {
    return this.forward(this.httpService.get(`${USER_BASE_URL}${API_ENDPOINT.USER}`));
  }

  findOne(id: number): Promise<UserEntity> {
    return this.forward(this.httpService.get(`${USER_BASE_URL}${API_ENDPOINT.USER}/${id}`));
  }

  update(userId: number, body: UpdateUserDTO): Promise<UserEntity> {
    return this.forward(
      this.httpService.put(`${USER_BASE_URL}${API_ENDPOINT.USER}/${userId}`, body),
    );
  }

  remove(userId: number): Promise<void> {
    return this.forward(
      this.httpService.delete(`${USER_BASE_URL}${API_ENDPOINT.USER}/${userId}`),
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
            : 'User service error';

        return new HttpException(message, status);
      }

      return new HttpException(
        'User service unavailable',
        HttpStatus.BAD_GATEWAY,
      );
    }

    return new HttpException(
      'Unexpected error calling user service',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
