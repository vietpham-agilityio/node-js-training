import { ApiProperty } from '@nestjs/swagger';

// DDR-011: { data, meta: { page, limit, total, hasMore } } is the one envelope
// every list endpoint returns.
export class PaginationMetaDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  hasMore: boolean;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMetaDto;
}
