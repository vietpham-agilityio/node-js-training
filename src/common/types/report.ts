import { ReservationStatus } from 'src/modules/reservations/enums/reservation-status.enum';
import { ShowtimeStatus } from 'src/modules/showtimes/enums/showtime-status.enum';

export interface RevenueReportRawRow {
  showDate: string;
  movieId: string;
  movieTitle: string;
  ticketsSold: string;
  revenue: string;
}

export interface CapacityReportRawRow {
  showtimeId: string;
  movieTitle: string;
  hallName: string;
  showDate: string;
  showTime: string;
  status: ShowtimeStatus;
  totalSeats: string;
  seatsTaken: string;
  occupancyPct: string | null;
}

export interface AdminReservationRawRow {
  reservationId: string;
  reservationNumber: string;
  customerEmail: string;
  firstName: string;
  lastName: string;
  movieTitle: string;
  showDate: string;
  showTime: string;
  status: ReservationStatus;
  totalSeats: string;
  totalAmount: string;
  createdAt: Date;
}
