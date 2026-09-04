import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserRole } from '../enums/user-role.enum';
import { PaginationMetaDto } from '../../../common/dto/paginated-response.dto';

// Every User column except passwordHash — this is the shape any endpoint
// returning a user is allowed to send to a client.
export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  phoneNumber: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  dateOfBirth: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  address: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedUserResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty()
  meta: PaginationMetaDto;
}
