import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import type { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import {
  CapacityReportQueryDto,
  ReservationsReportQueryDto,
  RevenueReportQueryDto,
} from './dto/report-query.dto';
import {
  AdminReservationRowDto,
  CapacityReportRowDto,
  PaginatedCapacityReportResponseDto,
  PaginatedReservationsReportResponseDto,
  PaginatedRevenueReportResponseDto,
  RevenueReportRowDto,
} from './dto/report-response.dto';
import { ReportsService } from './reports.service';

// ADR-011/MO-17-19: admin-only aggregate reporting, all three routes guarded
// the same way as UsersController's admin routes.
@ApiTags('reports')
@Controller('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue by day and movie (admin only)' })
  @ApiOkResponse({ type: PaginatedRevenueReportResponseDto })
  getRevenue(
    @Query() query: RevenueReportQueryDto,
  ): Promise<PaginatedResponseDto<RevenueReportRowDto>> {
    return this.reportsService.getRevenueReport(query);
  }

  @Get('capacity')
  @ApiOperation({ summary: 'Occupancy per showtime (admin only)' })
  @ApiOkResponse({ type: PaginatedCapacityReportResponseDto })
  getCapacity(
    @Query() query: CapacityReportQueryDto,
  ): Promise<PaginatedResponseDto<CapacityReportRowDto>> {
    return this.reportsService.getCapacityReport(query);
  }

  @Get('reservations')
  @ApiOperation({
    summary: 'All reservations across all customers (admin only)',
  })
  @ApiOkResponse({ type: PaginatedReservationsReportResponseDto })
  getReservations(
    @Query() query: ReservationsReportQueryDto,
  ): Promise<PaginatedResponseDto<AdminReservationRowDto>> {
    return this.reportsService.getReservationsReport(query);
  }
}
