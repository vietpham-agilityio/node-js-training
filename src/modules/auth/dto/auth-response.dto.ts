import { ApiProperty } from '@nestjs/swagger';

// Response shape only — not validated, just documented for Swagger.
export class TokenPairDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ description: 'Access token lifetime in seconds' })
  expiresIn: number;
}
