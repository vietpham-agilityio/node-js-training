import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { TCPProxyService } from '@app/common';
import {
  AUTH_MESSAGES,
  type LoginResponse,
  type RegisterPayload,
} from '@app/constants';

@Injectable()
export class AuthProxyService extends TCPProxyService {
  protected readonly unavailableMessage = 'Auth service unavailable';

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {
    super();
  }

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

  protected statusFallbackMessage(status: number): string {
    return status === HttpStatus.UNAUTHORIZED
      ? 'Invalid credentials'
      : 'Auth service error';
  }
}
