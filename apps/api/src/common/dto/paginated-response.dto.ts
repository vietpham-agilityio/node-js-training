// DDR-011: { data, meta: { page, limit, total, hasMore } } is the one envelope
// every list endpoint returns.
export class PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMetaDto;
}
