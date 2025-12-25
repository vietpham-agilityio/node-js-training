import {
  Booking,
  BookingStatus,
  PaymentStatus,
  TicketStatus,
} from '@/features/booking/types/booking';
import { SeatReservationStatus } from '@/features/booking/types/cinema';
import { supabase } from '@/services/supabase/client';
import { keysToCamel } from '@/utils/convert';
import {
  BookingsService,
  bookingsService,
  CreateBookingData,
} from '../booking';

const createMockQueryBuilder = () => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn(),
  then: jest.fn(),
});

// Global mock query builder instance
const mockQueryBuilder = createMockQueryBuilder();

jest.mock('@/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => mockQueryBuilder),
    rpc: jest.fn(),
  },
}));

jest.unmock('@/utils/convert');

describe('BookingsService', () => {
  let service: BookingsService;
  const from = supabase.from as jest.Mock;
  const rpc = supabase.rpc as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = BookingsService.getInstance();

    // Reset mockQueryBuilder methods
    Object.values(mockQueryBuilder).forEach(mockFn => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockClear();
        if (
          mockFn !== mockQueryBuilder.single &&
          mockFn !== mockQueryBuilder.then
        ) {
          mockFn.mockReturnThis?.();
        }
      }
    });

    // Default implementations for async operations
    (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
      resolve({ data: [], error: null }),
    );
    (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });

    // Default RPC mock
    rpc.mockResolvedValue({ data: null, error: null });
  });

  it('should be a singleton', () => {
    const instance1 = BookingsService.getInstance();
    const instance2 = BookingsService.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(bookingsService);
  });

  describe('getBookings', () => {
    it('should return a list of bookings for a user', async () => {
      const mockData = [
        {
          id: 'booking1',
          user_id: 'user1',
          booking_number: 'BK001',
          total_seats: 2,
          total_amount: 200,
        },
      ];

      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: mockData, error: null }),
      );

      const bookings = await service.getBookings('user1');

      expect(from).toHaveBeenCalledWith('bookings');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user1');
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
      expect(bookings).toEqual(keysToCamel(mockData));
    });

    it('should filter bookings by status when provided', async () => {
      const mockData = [{ id: 'booking1', booking_status: 'active' }];

      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: mockData, error: null }),
      );

      await service.getBookings('user1', 'active');

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user1');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'booking_status',
        'active',
      );
    });

    it('should throw an error if fetching bookings fails', async () => {
      const error = new Error('Database error');

      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(
        (_resolve, reject) => reject(error),
      );

      await expect(service.getBookings('user1')).rejects.toThrow(error);
    });
  });

  describe('getBookingById', () => {
    it('should return a single booking with full details', async () => {
      const mockBooking = {
        id: 'booking1',
        booking_number: 'BK001',
        total_amount: 200,
        showtime: {
          id: 'show1',
          movie: { id: 'movie1', title: 'Test Movie' },
        },
      };

      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockBooking,
        error: null,
      });

      const booking = await service.getBookingById('booking1');

      expect(from).toHaveBeenCalledWith('bookings');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'booking1');
      expect(mockQueryBuilder.single).toHaveBeenCalled();
      expect(booking).toEqual(keysToCamel(mockBooking));
    });

    it('should throw an error if booking is not found', async () => {
      const error = new Error('Booking not found');

      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.getBookingById('nonexistent')).rejects.toThrow(
        error,
      );
    });
  });

  describe('createBooking', () => {
    const createData: CreateBookingData = {
      userId: 'user1',
      showtimeId: 'show1',
      seats: ['A1', 'A2'],
      totalAmount: 200,
    };

    it('should create a booking with tickets successfully', async () => {
      const mockBooking = {
        id: 'booking1',
        booking_number: 'BK123',
        total_amount: 200,
      };

      // Mock RPC calls
      rpc
        .mockResolvedValueOnce({ data: 'BK123', error: null }) // generate_booking_number
        .mockResolvedValueOnce({ data: 'TKT001', error: null }) // generate_ticket_number (seat 1)
        .mockResolvedValueOnce({ data: 'qr-data-1', error: null }) // generate_qr_code_data (seat 1)
        .mockResolvedValueOnce({ data: 'TKT002', error: null }) // generate_ticket_number (seat 2)
        .mockResolvedValueOnce({ data: 'qr-data-2', error: null }) // generate_qr_code_data (seat 2)
        .mockResolvedValueOnce({ data: null, error: null }); // decrement_available_seats

      // Mock booking insertion
      (mockQueryBuilder.single as jest.Mock).mockResolvedValueOnce({
        data: mockBooking,
        error: null,
      });

      // Mock ticket insertions (returns promise-like objects)
      (mockQueryBuilder.then as jest.Mock)
        .mockImplementationOnce(resolve =>
          resolve({ data: { id: 'ticket1' }, error: null }),
        )
        .mockImplementationOnce(resolve =>
          resolve({ data: { id: 'ticket2' }, error: null }),
        );

      // Mock getBookingById
      const getBookingByIdSpy = jest
        .spyOn(service, 'getBookingById')
        .mockResolvedValue(keysToCamel(mockBooking));

      const result = await service.createBooking(createData);

      expect(rpc).toHaveBeenCalledWith('generate_booking_number');
      expect(from).toHaveBeenCalledWith('bookings');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: createData.userId,
          showtime_id: createData.showtimeId,
          total_seats: createData.seats.length,
          seat_numbers: createData.seats,
          total_amount: createData.totalAmount,
          payment_status: PaymentStatus.PAID,
          booking_status: BookingStatus.ACTIVE,
        }),
      );
      expect(from).toHaveBeenCalledWith('tickets');
      expect(rpc).toHaveBeenCalledWith('decrement_available_seats', {
        showtime_id: createData.showtimeId,
        seats_count: createData.seats.length,
      });
      expect(getBookingByIdSpy).toHaveBeenCalledWith(mockBooking.id);
      expect(result).toEqual(keysToCamel(mockBooking));
    });

    it('should apply discount when promo code is provided', async () => {
      const dataWithPromo: CreateBookingData = {
        ...createData,
        promoCodeId: 'promo123',
        discountAmount: 20,
      };

      const mockBooking = {
        id: 'booking1',
        booking_number: 'BK123',
      } as unknown as Booking;

      rpc.mockResolvedValue({ data: 'BK123', error: null });
      (mockQueryBuilder.single as jest.Mock).mockResolvedValueOnce({
        data: mockBooking,
        error: null,
      });
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: {}, error: null }),
      );
      jest.spyOn(service, 'getBookingById').mockResolvedValue(mockBooking);

      await service.createBooking(dataWithPromo);

      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          subtotal: 220, // totalAmount + discountAmount
          discount_amount: 20,
          total_amount: 200,
          promo_code_id: 'promo123',
        }),
      );
    });

    it('should throw an error if booking insertion fails', async () => {
      const error = new Error('Insert failed');

      rpc.mockResolvedValueOnce({ data: 'BK123', error: null });
      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.createBooking(createData)).rejects.toThrow(error);
    });

    it('should use fallback values when RPC calls fail', async () => {
      const mockBooking = {
        id: 'booking1',
        booking_number: 'BK123',
      } as unknown as Booking;

      // Mock RPC failures
      rpc
        .mockResolvedValueOnce({ data: null, error: new Error('RPC failed') }) // generate_booking_number fails
        .mockResolvedValue({ data: null, error: new Error('RPC failed') }); // All other RPCs fail

      (mockQueryBuilder.single as jest.Mock).mockResolvedValueOnce({
        data: mockBooking,
        error: null,
      });
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: {}, error: null }),
      );
      jest.spyOn(service, 'getBookingById').mockResolvedValue(mockBooking);

      const result = await service.createBooking(createData);

      // Should still succeed with fallback values
      expect(result).toEqual(mockBooking);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          booking_number: expect.stringMatching(/^BK\d+$/),
        }),
      );
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking and its tickets', async () => {
      (mockQueryBuilder.then as jest.Mock)
        .mockImplementationOnce(resolve => resolve({ data: [], error: null })) // bookings update
        .mockImplementationOnce(resolve => resolve({ data: [], error: null })); // tickets update

      await service.cancelBooking('booking1');

      expect(from).toHaveBeenCalledWith('bookings');
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          booking_status: BookingStatus.CANCELLED,
        }),
      );
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'booking1');

      expect(from).toHaveBeenCalledWith('tickets');
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        status: TicketStatus.CANCELLED,
      });
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'booking_id',
        'booking1',
      );
    });

    it('should throw an error if booking cancellation fails', async () => {
      const error = new Error('Cancel failed');

      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(
        (_resolve, reject) => reject(error),
      );

      await expect(service.cancelBooking('booking1')).rejects.toThrow(error);
    });

    it('should throw if ticket cancellation fails', async () => {
      const ticketError = new Error('Ticket cancel failed');

      (mockQueryBuilder.then as jest.Mock)
        .mockImplementationOnce(resolve => resolve({ data: [], error: null })) // booking succeeds
        .mockImplementationOnce((_resolve, reject) => reject(ticketError)); // tickets fails

      await expect(service.cancelBooking('booking1')).rejects.toThrow(
        ticketError,
      );
    });
  });

  describe('reserveSeats', () => {
    it('should reserve seats for a showtime', async () => {
      const mockReservation = {
        id: 'reservation1',
        showtime_id: 'show1',
        user_id: 'user1',
        seat_numbers: ['A1', 'A2'],
        status: SeatReservationStatus.RESERVED,
      };

      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockReservation,
        error: null,
      });

      const result = await service.reserveSeats('show1', 'user1', ['A1', 'A2']);

      expect(from).toHaveBeenCalledWith('seat_reservations');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          showtime_id: 'show1',
          user_id: 'user1',
          seat_numbers: ['A1', 'A2'],
          status: SeatReservationStatus.RESERVED,
        }),
      );
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.single).toHaveBeenCalled();
      expect(result).toEqual(keysToCamel(mockReservation));
    });

    it('should set reservation to expire in 10 minutes', async () => {
      const mockReservation = {
        id: 'reservation1',
        reserved_until: new Date().toISOString(),
      };

      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockReservation,
        error: null,
      });

      await service.reserveSeats('show1', 'user1', ['A1']);

      const insertCall = (mockQueryBuilder.insert as jest.Mock).mock
        .calls[0][0];
      const reservedUntil = new Date(insertCall.reserved_until);
      const now = new Date();
      const diffMinutes = (reservedUntil.getTime() - now.getTime()) / 1000 / 60;

      expect(diffMinutes).toBeGreaterThanOrEqual(9);
      expect(diffMinutes).toBeLessThanOrEqual(11);
    });

    it('should throw an error if reservation fails', async () => {
      const error = new Error('Reservation failed');

      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      await expect(
        service.reserveSeats('show1', 'user1', ['A1']),
      ).rejects.toThrow(error);
    });
  });

  describe('releaseSeats', () => {
    it('should release a seat reservation', async () => {
      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: [], error: null }),
      );

      await service.releaseSeats('reservation1');

      expect(from).toHaveBeenCalledWith('seat_reservations');
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        status: SeatReservationStatus.RELEASED,
      });
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'reservation1');
    });

    it('should throw an error if release fails', async () => {
      const error = new Error('Release failed');

      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(
        (_resolve, reject) => reject(error),
      );

      await expect(service.releaseSeats('reservation1')).rejects.toThrow(error);
    });
  });

  describe('getBookingsPaginated', () => {
    it('should return paginated bookings', async () => {
      const mockData = [
        { id: 'booking1', booking_number: 'BK001' },
        { id: 'booking2', booking_number: 'BK002' },
      ];

      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(resolve =>
        resolve({ data: mockData, error: null }),
      );

      const bookings = await service.getBookingsPaginated(
        'user1',
        undefined,
        0,
        10,
      );

      expect(from).toHaveBeenCalledWith('bookings');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user1');
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9);
      expect(bookings).toEqual(keysToCamel(mockData));
    });

    it('should calculate correct range for different pages', async () => {
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: [], error: null }),
      );

      // Page 0, limit 10
      await service.getBookingsPaginated('user1', undefined, 0, 10);
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9);

      // Page 1, limit 10
      await service.getBookingsPaginated('user1', undefined, 1, 10);
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(10, 19);

      // Page 2, limit 20
      await service.getBookingsPaginated('user1', undefined, 2, 20);
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(40, 59);
    });

    it('should filter by status when provided', async () => {
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: [], error: null }),
      );

      await service.getBookingsPaginated('user1', 'active', 0, 10);

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user1');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'booking_status',
        'active',
      );
    });

    it('should throw an error if pagination query fails', async () => {
      const error = new Error('Query failed');

      (mockQueryBuilder.then as jest.Mock).mockImplementationOnce(
        (_resolve, reject) => reject(error),
      );

      await expect(service.getBookingsPaginated('user1')).rejects.toThrow(
        error,
      );
    });
  });
});
