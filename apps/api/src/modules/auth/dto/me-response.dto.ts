import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '../../users/enums/user-role.enum';

// Response shape only — mirrors AuthenticatedUser, documented for Swagger so the
// generated contract carries a type for GET /auth/me.
export class MeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;
}
