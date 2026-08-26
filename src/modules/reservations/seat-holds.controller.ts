import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateSeatHoldDto, HoldSeatsResponseDto } from './dto/seat-hold.dto';
import { SeatHoldsService } from './seat-holds.service';

@ApiTags('showtimes')
@Controller('showtimes')
export class SeatHoldsController {
  constructor(private readonly seatHoldsService: SeatHoldsService) {}

  // DDR-015: auth begins at seat selection, the first write in the flow.
  @Post(':id/hold')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Hold one or more seats for a showtime (10-minute TTL)',
  })
  @ApiCreatedResponse({ type: HoldSeatsResponseDto })
  holdSeats(
    @Param('id') id: string,
    @Body() dto: CreateSeatHoldDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HoldSeatsResponseDto> {
    return this.seatHoldsService.holdSeats(id, dto, user.id);
  }
}
