import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UserRole } from '../users/enums/user-role.enum';
import {
  CreateMovieDto,
  MovieListQueryDto,
  MovieResponseDto,
  PaginatedMovieResponseDto,
  UpdateMovieDto,
} from './dto/movie.dto';
import { MoviesService } from './movies.service';

@ApiTags('movies')
@ApiBearerAuth()
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'List movies (public catalogue; admin token also sees inactive)',
  })
  @ApiOkResponse({ type: PaginatedMovieResponseDto })
  findAll(
    @Query() query: MovieListQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<MovieResponseDto>> {
    return this.moviesService.findAllMovies(query, {
      includeInactive: user?.role === UserRole.ADMIN,
    });
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get one movie (public; admin token also sees inactive)',
  })
  @ApiOkResponse({ type: MovieResponseDto })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<MovieResponseDto> {
    return this.moviesService.findOneMovie(id, {
      includeInactive: user?.role === UserRole.ADMIN,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a movie (admin only)' })
  @ApiCreatedResponse({ type: MovieResponseDto })
  create(@Body() dto: CreateMovieDto): Promise<MovieResponseDto> {
    return this.moviesService.createMovie(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a movie (admin only)' })
  @ApiOkResponse({ type: MovieResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMovieDto,
  ): Promise<MovieResponseDto> {
    return this.moviesService.updateMovie(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate a movie (admin only)' })
  remove(@Param('id') id: string): Promise<void> {
    return this.moviesService.remove(id);
  }
}
