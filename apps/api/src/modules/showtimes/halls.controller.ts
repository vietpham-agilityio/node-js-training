import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HallResponseDto } from './dto/hall.dto';
import { HallsService } from './halls.service';

@ApiTags('halls')
@Controller('halls')
export class HallsController {
  constructor(private readonly hallsService: HallsService) {}

  // DDR-015: public. A hall's name, format and capacity are part of the
  // catalogue a customer browses before choosing a showtime.
  @Get()
  @ApiOperation({ summary: 'List halls with seat capacity (public)' })
  @ApiOkResponse({ type: [HallResponseDto] })
  findAll(): Promise<HallResponseDto[]> {
    return this.hallsService.findAllHalls();
  }
}
