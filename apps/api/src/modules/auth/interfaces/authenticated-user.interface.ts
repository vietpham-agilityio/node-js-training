import { UserRole } from '../../users/enums/user-role.enum';

// What JwtStrategy.validate() puts on request.user. Carries the role as a
// token claim (ADR-005), so authorization needs no extra query.
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}
