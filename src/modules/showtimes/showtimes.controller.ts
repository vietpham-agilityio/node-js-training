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
  CreateShowtimeDto,
  PaginatedShowtimeResponseDto,
  ShowtimeListQueryDto,
  ShowtimeResponseDto,
  ShowtimeSeatResponseDto,
  UpdateShowtimeDto,
} from './dto/showtime.dto';
import { ShowtimesService } from './showtimes.service';

@ApiTags('showtimes')
@Controller('showtimes')
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary:
      'List showtimes with availability (public; admin also sees cancelled)',
  })
  @ApiOkResponse({ type: PaginatedShowtimeResponseDto })
  findAll(
    @Query() query: ShowtimeListQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<ShowtimeResponseDto>> {
    return this.showtimesService.findAllShowtimes(query, {
      includeCancelled: user?.role === UserRole.ADMIN,
    });
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get one showtime (public; admin also sees cancelled)',
  })
  @ApiOkResponse({ type: ShowtimeResponseDto })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ShowtimeResponseDto> {
    return this.showtimesService.findOneShowtime(id, {
      includeCancelled: user?.role === UserRole.ADMIN,
    });
  }

  // DDR-015: browsing the seat map is public — a customer decides which
  // showtime to book by looking at it. A token is only needed to claim a seat,
  // and supplying one here additionally flags the caller's own holds.
  @Get(':id/seats')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Seat map for a showtime (public; a token flags your own holds)',
  })
  @ApiOkResponse({ type: [ShowtimeSeatResponseDto] })
  findSeatMap(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ShowtimeSeatResponseDto[]> {
    return this.showtimesService.findShowtimeSeatMap(
      id,
      { includeCancelled: user?.role === UserRole.ADMIN },
      user?.id,
    );
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a showtime (admin only)' })
  @ApiCreatedResponse({ type: ShowtimeResponseDto })
  create(@Body() dto: CreateShowtimeDto): Promise<ShowtimeResponseDto> {
    return this.showtimesService.createShowtime(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update or reschedule a showtime (admin only)' })
  @ApiOkResponse({ type: ShowtimeResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateShowtimeDto,
  ): Promise<ShowtimeResponseDto> {
    return this.showtimesService.updateShowtime(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a showtime (admin only, soft delete)' })
  remove(@Param('id') id: string): Promise<void> {
    return this.showtimesService.remove(id);
  }
}
