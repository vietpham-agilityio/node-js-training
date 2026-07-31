import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map, Observable } from 'rxjs';
import { USER_BASE_URL, API_ENDPOINT } from '@app/constants/shared/router/route';
import { CreateUserDTO, UpdateUserDTO } from 'apps/user/src/user.dto';
import { UserEntity } from 'apps/user/src/user.entity';

@Injectable()
export class UserProxyService {
  constructor(private readonly httpService: HttpService) { }

  create(body: CreateUserDTO, authorization?: string): Promise<UserEntity> {
    return this.forward(
      this.httpService.post(
        `${USER_BASE_URL}${API_ENDPOINT.USER}`,
        body,
        this.withAuth(authorization),
      ),
    );
  }

  findAll(authorization?: string): Promise<UserEntity[]> {
    return this.forward(
      this.httpService.get(
        `${USER_BASE_URL}${API_ENDPOINT.USER}`,
        this.withAuth(authorization),
      ),
    );
  }

  findOne(id: number, authorization?: string): Promise<UserEntity> {
    return this.forward(
      this.httpService.get(
        `${USER_BASE_URL}${API_ENDPOINT.USER}/${id}`,
        this.withAuth(authorization),
      ),
    );
  }

  update(
    userId: number,
    body: UpdateUserDTO,
    authorization?: string,
  ): Promise<UserEntity> {
    return this.forward(
      this.httpService.put(
        `${USER_BASE_URL}${API_ENDPOINT.USER}/${userId}`,
        body,
        this.withAuth(authorization),
      ),
    );
  }

  remove(userId: number, authorization?: string): Promise<void> {
    return this.forward(
      this.httpService.delete(
        `${USER_BASE_URL}${API_ENDPOINT.USER}/${userId}`,
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

        return new HttpException({ message }, status);
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
