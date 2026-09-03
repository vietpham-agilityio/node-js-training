import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaDto } from '../../../common/dto/paginated-response.dto';
import { ReservationStatus } from '../../reservations/enums/reservation-status.enum';
import { ShowtimeStatus } from '../../showtimes/enums/showtime-status.enum';

// DDR-010: "revenue" here means booking value at reservation confirmation,
// not collected payment — no payment step exists in this design.
export class RevenueReportRowDto {
  @ApiProperty()
  showDate!: string;

  @ApiProperty()
  movieId!: string;

  @ApiProperty()
  movieTitle!: string;

  @ApiProperty()
  ticketsSold!: number;

  @ApiProperty()
  revenue!: number;
}

export class PaginatedRevenueReportResponseDto {
  @ApiProperty({ type: [RevenueReportRowDto] })
  data!: RevenueReportRowDto[];

  @ApiProperty()
  meta!: PaginationMetaDto;
}

export class CapacityReportRowDto {
  @ApiProperty()
  showtimeId!: string;

  @ApiProperty()
  movieTitle!: string;

  @ApiProperty()
  hallName!: string;

  @ApiProperty()
  showDate!: string;

  @ApiProperty()
  showTime!: string;

  @ApiProperty({ enum: ShowtimeStatus })
  status!: ShowtimeStatus;

  @ApiProperty()
  totalSeats!: number;

  @ApiProperty()
  seatsTaken!: number;

  @ApiProperty()
  occupancyPct!: number;
}

export class PaginatedCapacityReportResponseDto {
  @ApiProperty({ type: [CapacityReportRowDto] })
  data!: CapacityReportRowDto[];

  @ApiProperty()
  meta!: PaginationMetaDto;
}

export class AdminReservationRowDto {
  @ApiProperty()
  reservationId!: string;

  @ApiProperty()
  reservationNumber!: string;

  @ApiProperty()
  customerEmail!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  movieTitle!: string;

  @ApiProperty()
  showDate!: string;

  @ApiProperty()
  showTime!: string;

  @ApiProperty({ enum: ReservationStatus })
  status!: ReservationStatus;

  @ApiProperty()
  totalSeats!: number;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class PaginatedReservationsReportResponseDto {
  @ApiProperty({ type: [AdminReservationRowDto] })
  data!: AdminReservationRowDto[];

  @ApiProperty()
  meta!: PaginationMetaDto;
}
