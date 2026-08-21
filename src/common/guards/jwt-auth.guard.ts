import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AppException } from '../exceptions/app.exception';
import { ErrorCode } from '../exceptions/error-codes';

// Applied per-route (@UseGuards(JwtAuthGuard)) — auth is opt-in, not global,
// since most catalogue browsing routes are public.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw new AppException(
        ErrorCode.UNAUTHENTICATED,
        'A valid access token is required',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
}
