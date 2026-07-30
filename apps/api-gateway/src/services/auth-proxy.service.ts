import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { extractRpcErrorMessage } from '@app/common';
import {
  AUTH_MESSAGES,
  type LoginResponse,
  type RegisterPayload,
} from '@app/constants';

@Injectable()
export class AuthProxyService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  login(email: string, password: string): Promise<LoginResponse> {
    return firstValueFrom(
      this.authClient
        .send<LoginResponse>(AUTH_MESSAGES.LOGIN, { email, password })
        .pipe(
          catchError((err: unknown) => {
            throw this.toHttpException(err);
          }),
        ),
    );
  }

  register(data: RegisterPayload): Promise<LoginResponse> {
    return firstValueFrom(
      this.authClient.send<LoginResponse>(AUTH_MESSAGES.REGISTER, data).pipe(
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

    if (status === HttpStatus.UNAUTHORIZED) {
      return new HttpException(
        extractRpcErrorMessage(error, 'Invalid credentials'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    return new HttpException(
      extractRpcErrorMessage(error, 'Auth service unavailable'),
      HttpStatus.BAD_GATEWAY,
    );
  }
}
