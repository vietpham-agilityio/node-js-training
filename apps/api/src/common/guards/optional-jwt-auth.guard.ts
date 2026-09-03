import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Same strategy as JwtAuthGuard, but a missing/invalid token is not an
// error — request.user is simply left undefined. Used by routes that are
// public but change shape for an authenticated (or admin) caller.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    _err: unknown,
    user: TUser,
  ): TUser | undefined {
    return user || undefined;
  }
}
