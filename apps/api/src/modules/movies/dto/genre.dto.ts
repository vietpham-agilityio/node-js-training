import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

import { PaginationMetaDto } from '../../../common/dto/paginated-response.dto';

// BR-13: genres.name is unique — enforced in GenresService, not here, so the
// duplicate case can carry GENRE_NAME_ALREADY_EXISTS instead of a generic 400.
export class CreateGenreDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}

export class UpdateGenreDto extends CreateGenreDto {}

export class GenreResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class PaginatedGenreResponseDto {
  @ApiProperty({ type: [GenreResponseDto] })
  data: GenreResponseDto[];

  @ApiProperty()
  meta: PaginationMetaDto;
}
