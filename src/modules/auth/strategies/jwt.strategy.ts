import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { JwtConfig } from '../../../config/jwt.config';
import type { UserRole } from '../../users/enums/user-role.enum';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

// ADR-005: access-token validation is stateless — the role travels as a
// claim, so this never queries the database.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwt = configService.getOrThrow<JwtConfig>('jwt');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt.publicKey,
      algorithms: ['RS256'],
    });
  }

  validate({ email, role, sub }: AccessTokenPayload): AuthenticatedUser {
    return { id: sub, email, role };
  }
}
