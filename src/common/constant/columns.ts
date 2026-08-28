import { CapacityReportSortField } from 'src/modules/reports/enums/capacity-report-sort-field.enum';
import { ReservationsReportSortField } from 'src/modules/reports/enums/reservations-report-sort-field.enum';
import { RevenueReportSortField } from 'src/modules/reports/enums/revenue-report-sort-field.enum';

export const REVENUE_ORDER_COLUMN: Record<RevenueReportSortField, string> = {
  [RevenueReportSortField.SHOW_DATE]: '"showDate"',
  [RevenueReportSortField.MOVIE_TITLE]: '"movieTitle"',
  [RevenueReportSortField.TICKETS_SOLD]: '"ticketsSold"',
  [RevenueReportSortField.REVENUE]: '"revenue"',
};

export const CAPACITY_ORDER_COLUMN: Record<CapacityReportSortField, string> = {
  [CapacityReportSortField.SHOW_DATE]: '"showDate"',
  [CapacityReportSortField.SHOW_TIME]: '"showTime"',
  [CapacityReportSortField.MOVIE_TITLE]: '"movieTitle"',
  [CapacityReportSortField.HALL_NAME]: '"hallName"',
  [CapacityReportSortField.TOTAL_SEATS]: '"totalSeats"',
  [CapacityReportSortField.SEATS_TAKEN]: '"seatsTaken"',
  [CapacityReportSortField.OCCUPANCY_PCT]: '"occupancyPct"',
};

export const RESERVATIONS_ORDER_COLUMN: Record<
  ReservationsReportSortField,
  string
> = {
  [ReservationsReportSortField.CREATED_AT]: '"createdAt"',
  [ReservationsReportSortField.SHOW_DATE]: '"showDate"',
  [ReservationsReportSortField.CUSTOMER_EMAIL]: '"customerEmail"',
  [ReservationsReportSortField.MOVIE_TITLE]: '"movieTitle"',
  [ReservationsReportSortField.TOTAL_SEATS]: '"totalSeats"',
  [ReservationsReportSortField.TOTAL_AMOUNT]: '"totalAmount"',
  [ReservationsReportSortField.STATUS]: '"status"',
};
