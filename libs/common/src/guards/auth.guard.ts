import {
  CanActivate,
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthTokenPayload } from '@app/constants';
import type { AuthenticatedRequest } from './authenticated-request';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException('Missing bearer token');

    try {
      request.user = await this.jwtService.verifyAsync<AuthTokenPayload>(
        token,
        { algorithms: ['RS256'] },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(
    request: AuthenticatedRequest,
  ): string | undefined {
    const authHeader = request.headers['authorization'];
    if (!authHeader || Array.isArray(authHeader)) {
      return undefined;
    }

    const [scheme, token] = authHeader.split(' ');
    return scheme === 'Bearer' ? token : undefined;
  }
}
