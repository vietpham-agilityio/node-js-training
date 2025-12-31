import { fireEvent, render } from '@testing-library/react-native';

import MyTicketScreen from '../index';

// Types
import {
  BookingStatus,
  PaymentStatus,
  Ticket,
  TicketStatus,
} from '@/features/booking/types/booking';
import { GenreMovie } from '@/features/booking/types/movie';

// Mock expo-router
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: (route: string) => mockPush(route),
  },
  useFocusEffect: (callback: () => void | (() => void)) => {
    const cleanup = callback();
    return cleanup;
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
  };
});

// Mock expo-image
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: ({ testID, ...props }: any) => <View testID={testID} {...props} />,
  };
});

// Mock utils
jest.mock('@/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

jest.mock('@/utils/formats', () => ({
  formatIDR: (value: string | number) => `IDR ${value}`,
  formatMovieDuration: (minutes: number) =>
    `${Math.floor(minutes / 60)}h ${minutes % 60}m`,
  formatShowtimeDate: (time?: string, date?: string) => {
    if (!time && !date) return '';
    return `${time || ''} ${date || ''}`.trim();
  },
}));

// Mock custom hooks
const mockCheckExpiredTickets = jest.fn().mockResolvedValue(0);
const mockFetchNextPage = jest.fn();
const mockRefetch = jest.fn();

let mockTicketsData: { pages: Ticket[][] } | undefined;
let mockIsLoading = false;
let mockIsError = false;
let mockError: Error | null = null;
let mockIsFetchingNextPage = false;
let mockHasNextPage = false;
let mockIsRefetching = false;

jest.mock('@/features/ticket/hooks/useTicketExpiration', () => ({
  useTicketExpiration: () => ({
    checkExpiredTickets: mockCheckExpiredTickets,
  }),
}));

jest.mock('@/features/ticket/hooks/useTickets', () => ({
  useTicketsInfinite: () => ({
    data: mockTicketsData,
    isLoading: mockIsLoading,
    isError: mockIsError,
    error: mockError,
    isFetchingNextPage: mockIsFetchingNextPage,
    hasNextPage: mockHasNextPage,
    fetchNextPage: mockFetchNextPage,
    refetch: mockRefetch,
    isRefetching: mockIsRefetching,
  }),
}));

// Mock constants
jest.mock('@/constants', () => ({
  ERROR_MESSAGES: {
    TICKET_NETWORK_ERROR:
      "We're having trouble loading tickets. Please try again later.",
  },
  MESSAGES: {
    NO_TICKETS: 'Start your movie journey by booking a ticket',
    NO_ACTIVE_TICKETS: 'Book a movie to see your active tickets here',
    NO_EXPIRED_TICKETS: 'Your expired and used tickets will appear here',
  },
  ROUTES: {
    HOME: '/(main)/home',
    TICKET_DETAILS: (id: string) => `/(main)/tickets/${id}`,
  },
  Size: {
    EXTRA_SMALL: 'extra-small',
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
  },
  IMAGE_SIZE_MAP: {
    'extra-small': 'w-16 h-24',
    small: 'w-21 h-30',
    medium: 'w-30 h-43',
    large: 'w-40 h-56',
  },
  BLUR_HASH: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
  TABS_FOOTER_HEIGHT: 80,
  TICKET_TABS: [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'expired', label: 'Expired' },
  ],
}));

// Mock ticket data
const createMockTicket = (
  id: string,
  status: TicketStatus = TicketStatus.ACTIVE,
): Ticket =>
  ({
    id,
    bookingId: `booking-${id}`,
    seatNumber: 'A1',
    ticketNumber: `TKT-${id}`,
    qrCodeData: `{"booking_id":"booking-${id}","seat":"A1"}`,
    price: 50000,
    status,
    scannedAt: undefined,
    createdAt: '2025-01-01T00:00:00Z',
    booking: {
      id: `booking-${id}`,
      bookingNumber: `BKG-${id}`,
      bookingStatus: BookingStatus.USED,
      userId: 'user-1',
      showtimeId: 'showtime-1',
      totalSeats: 1,
      seatNumbers: ['A1'],
      subtotal: 50000,
      discountAmount: 0,
      totalAmount: 50000,
      paymentMethod: 'wallet',
      paymentStatus: PaymentStatus.PAID,
      expiresAt: '2025-01-01T00:00:00Z',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      showtime: {
        id: 'showtime-1',
        showDate: '2025-01-15',
        showTime: '14:00',
        endTime: '16:00',
        price: 50000,
        movie: {
          id: 'movie-1',
          title: `Test Movie ${id}`,
          posterUrl: 'https://example.com/poster.jpg',
          genre: [GenreMovie.ACTION],
          durationMinutes: 120,
          rating: 8.5,
        },
        cinemaHall: {
          id: 'hall-1',
          name: 'Hall 1',
          hallType: 'Standard',
          cinema: {
            id: 'cinema-1',
            name: 'Test Cinema',
            city: 'Jakarta',
            address: '123 Test St',
          },
        },
      },
    },
  }) as Ticket;

describe('MyTicketScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTicketsData = undefined;
    mockIsLoading = false;
    mockIsError = false;
    mockError = null;
    mockIsFetchingNextPage = false;
    mockHasNextPage = false;
    mockIsRefetching = false;
  });

  describe('Loading State', () => {
    it('should show skeleton cards when loading', () => {
      mockIsLoading = true;
      mockTicketsData = { pages: [] };

      const { getAllByTestId } = render(<MyTicketScreen />);

      const skeletons = getAllByTestId('horizontal-card-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render multiple skeleton cards when loading', () => {
      mockIsLoading = true;
      mockTicketsData = { pages: [] };

      const { getAllByTestId } = render(<MyTicketScreen />);

      const skeletons = getAllByTestId('horizontal-card-skeleton');
      expect(skeletons.length).toBe(3);
    });
  });

  describe('Error State', () => {
    it('should show error message when loading fails', () => {
      mockIsError = true;
      mockError = new Error('Network error');
      mockTicketsData = { pages: [] };

      const { getByText } = render(<MyTicketScreen />);

      expect(
        getByText(
          "We're having trouble loading tickets. Please try again later.",
        ),
      ).toBeTruthy();
      expect(getByText('Network error')).toBeTruthy();
    });

    it('should show retry button on error', () => {
      mockIsError = true;
      mockError = new Error('Network error');
      mockTicketsData = { pages: [] };

      const { getByText } = render(<MyTicketScreen />);

      expect(getByText('Retry')).toBeTruthy();
    });

    it('should call refetch when retry button is pressed', () => {
      mockIsError = true;
      mockError = new Error('Network error');
      mockTicketsData = { pages: [] };

      const { getByText } = render(<MyTicketScreen />);

      fireEvent.press(getByText('Retry'));

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should show default error message when error has no message', () => {
      mockIsError = true;
      mockError = new Error('');
      mockTicketsData = { pages: [] };

      const { getByText } = render(<MyTicketScreen />);

      expect(getByText('Please try again')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no tickets', () => {
      mockTicketsData = { pages: [] };

      const { getByText } = render(<MyTicketScreen />);

      expect(getByText('No tickets yet')).toBeTruthy();
      expect(
        getByText('Start your movie journey by booking a ticket'),
      ).toBeTruthy();
    });

    it('should show Book Now button when no tickets', () => {
      mockTicketsData = { pages: [] };

      const { getByText } = render(<MyTicketScreen />);

      expect(getByText('Book Now')).toBeTruthy();
    });

    it('should navigate to home when Book Now is pressed', () => {
      mockTicketsData = { pages: [] };

      const { getByText } = render(<MyTicketScreen />);

      fireEvent.press(getByText('Book Now'));

      expect(mockPush).toHaveBeenCalledWith('/(main)/home');
    });

    it('should show active tickets empty message when active tab selected', () => {
      mockTicketsData = { pages: [] };

      const { getByText } = render(<MyTicketScreen />);

      // Switch to Active tab
      fireEvent.press(getByText('Active'));

      expect(getByText('No active tickets')).toBeTruthy();
      expect(
        getByText('Book a movie to see your active tickets here'),
      ).toBeTruthy();
    });

    it('should show expired tickets empty message when expired tab selected', () => {
      mockTicketsData = { pages: [] };

      const { getByText } = render(<MyTicketScreen />);

      // Switch to Expired tab
      fireEvent.press(getByText('Expired'));

      expect(getByText('No expired tickets')).toBeTruthy();
      expect(
        getByText('Your expired and used tickets will appear here'),
      ).toBeTruthy();
    });
  });

  describe('Ticket Display', () => {
    it('should display tickets when data is available', () => {
      const ticket = createMockTicket('1');
      mockTicketsData = { pages: [[ticket]] };

      const { getByText } = render(<MyTicketScreen />);

      expect(getByText('Test Movie 1')).toBeTruthy();
    });

    it('should display multiple tickets', () => {
      const tickets = [
        createMockTicket('1'),
        createMockTicket('2'),
        createMockTicket('3'),
      ];
      mockTicketsData = { pages: [tickets] };

      const { getByText } = render(<MyTicketScreen />);

      expect(getByText('Test Movie 1')).toBeTruthy();
      expect(getByText('Test Movie 2')).toBeTruthy();
      expect(getByText('Test Movie 3')).toBeTruthy();
    });

    it('should navigate to ticket details when ticket is pressed', () => {
      const ticket = createMockTicket('ticket-123');
      mockTicketsData = { pages: [[ticket]] };

      const { getByText } = render(<MyTicketScreen />);

      fireEvent.press(getByText('Test Movie ticket-123'));

      expect(mockPush).toHaveBeenCalledWith('/(main)/tickets/ticket-123');
    });
  });

  describe('Tab Filtering', () => {
    it('should show all tickets by default', () => {
      const tickets = [
        createMockTicket('1', TicketStatus.ACTIVE),
        createMockTicket('2', TicketStatus.EXPIRED),
        createMockTicket('3', TicketStatus.USED),
      ];
      mockTicketsData = { pages: [tickets] };

      const { getByText } = render(<MyTicketScreen />);

      expect(getByText('Test Movie 1')).toBeTruthy();
      expect(getByText('Test Movie 2')).toBeTruthy();
      expect(getByText('Test Movie 3')).toBeTruthy();
    });

    it('should filter active tickets when Active tab is selected', () => {
      const tickets = [
        createMockTicket('1', TicketStatus.ACTIVE),
        createMockTicket('2', TicketStatus.EXPIRED),
      ];
      mockTicketsData = { pages: [tickets] };

      const { getByText, queryByText } = render(<MyTicketScreen />);

      // Switch to Active tab
      fireEvent.press(getByText('Active'));

      expect(getByText('Test Movie 1')).toBeTruthy();
      expect(queryByText('Test Movie 2')).toBeNull();
    });

    it('should filter expired tickets when Expired tab is selected', () => {
      const tickets = [
        createMockTicket('1', TicketStatus.ACTIVE),
        createMockTicket('2', TicketStatus.EXPIRED),
        createMockTicket('3', TicketStatus.USED),
        createMockTicket('4', TicketStatus.CANCELLED),
      ];
      mockTicketsData = { pages: [tickets] };

      const { getByText, queryByText } = render(<MyTicketScreen />);

      // Switch to Expired tab
      fireEvent.press(getByText('Expired'));

      expect(queryByText('Test Movie 1')).toBeNull();
      expect(getByText('Test Movie 2')).toBeTruthy();
      expect(getByText('Test Movie 3')).toBeTruthy();
      expect(getByText('Test Movie 4')).toBeTruthy();
    });

    it('should switch back to All tab', () => {
      const tickets = [
        createMockTicket('1', TicketStatus.ACTIVE),
        createMockTicket('2', TicketStatus.EXPIRED),
      ];
      mockTicketsData = { pages: [tickets] };

      const { getByText } = render(<MyTicketScreen />);

      // Switch to Active tab
      fireEvent.press(getByText('Active'));
      // Switch back to All
      fireEvent.press(getByText('All'));

      expect(getByText('Test Movie 1')).toBeTruthy();
      expect(getByText('Test Movie 2')).toBeTruthy();
    });
  });

  describe('Pagination', () => {
    it('should call fetchNextPage when end is reached and hasNextPage', () => {
      const ticket = createMockTicket('1');
      mockTicketsData = { pages: [[ticket]] };
      mockHasNextPage = true;

      const { getByLabelText } = render(<MyTicketScreen />);

      const list = getByLabelText(/Tickets list/);
      fireEvent(list, 'onEndReached');

      expect(mockFetchNextPage).toHaveBeenCalled();
    });

    it('should not call fetchNextPage when no next page', () => {
      const ticket = createMockTicket('1');
      mockTicketsData = { pages: [[ticket]] };
      mockHasNextPage = false;

      const { getByLabelText } = render(<MyTicketScreen />);

      const list = getByLabelText(/Tickets list/);
      fireEvent(list, 'onEndReached');

      expect(mockFetchNextPage).not.toHaveBeenCalled();
    });

    it('should not call fetchNextPage when already fetching', () => {
      const ticket = createMockTicket('1');
      mockTicketsData = { pages: [[ticket]] };
      mockHasNextPage = true;
      mockIsFetchingNextPage = true;

      const { getByLabelText } = render(<MyTicketScreen />);

      const list = getByLabelText(/Tickets list/);
      fireEvent(list, 'onEndReached');

      expect(mockFetchNextPage).not.toHaveBeenCalled();
    });

    it('should show loading footer when fetching next page', () => {
      const ticket = createMockTicket('1');
      mockTicketsData = { pages: [[ticket]] };
      mockIsFetchingNextPage = true;

      const { getByText } = render(<MyTicketScreen />);

      expect(getByText('Loading more tickets...')).toBeTruthy();
    });
  });

  describe('Pull to Refresh', () => {
    it('should call checkExpiredTickets and refetch on refresh', async () => {
      const ticket = createMockTicket('1');
      mockTicketsData = { pages: [[ticket]] };

      const { getByLabelText } = render(<MyTicketScreen />);

      const list = getByLabelText(/Tickets list/);
      const refreshControl = list.props.refreshControl;

      await refreshControl.props.onRefresh();

      expect(mockCheckExpiredTickets).toHaveBeenCalled();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Focus Effect', () => {
    it('should check expired tickets when screen focuses', () => {
      mockTicketsData = { pages: [] };

      render(<MyTicketScreen />);

      expect(mockCheckExpiredTickets).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility label for screen', () => {
      mockTicketsData = { pages: [] };

      const { getByLabelText } = render(<MyTicketScreen />);

      expect(getByLabelText('My Ticket screen')).toBeTruthy();
    });

    it('should have accessibility label for tickets list', () => {
      const ticket = createMockTicket('1');
      mockTicketsData = { pages: [[ticket]] };

      const { getByLabelText } = render(<MyTicketScreen />);

      expect(getByLabelText(/Tickets list showing 1 all tickets/)).toBeTruthy();
    });

    it('should update accessibility label based on filter', () => {
      const tickets = [
        createMockTicket('1', TicketStatus.ACTIVE),
        createMockTicket('2', TicketStatus.ACTIVE),
      ];
      mockTicketsData = { pages: [tickets] };

      const { getByLabelText, getByText } = render(<MyTicketScreen />);

      // Switch to Active tab
      fireEvent.press(getByText('Active'));

      expect(
        getByLabelText(/Tickets list showing 2 active tickets/),
      ).toBeTruthy();
    });

    it('should have accessibility label for loading more', () => {
      const ticket = createMockTicket('1');
      mockTicketsData = { pages: [[ticket]] };
      mockIsFetchingNextPage = true;

      const { getByLabelText } = render(<MyTicketScreen />);

      expect(getByLabelText('Loading more tickets')).toBeTruthy();
    });

    it('should have accessibility role for error state', () => {
      mockIsError = true;
      mockError = new Error('Error');
      mockTicketsData = { pages: [] };

      const { UNSAFE_queryAllByProps } = render(<MyTicketScreen />);

      const alertElements = UNSAFE_queryAllByProps({
        accessibilityRole: 'alert',
      });
      expect(alertElements.length).toBeGreaterThan(0);
    });

    it('should have accessibility label for retry button', () => {
      mockIsError = true;
      mockError = new Error('Error');
      mockTicketsData = { pages: [] };

      const { getByLabelText } = render(<MyTicketScreen />);

      expect(getByLabelText('Retry loading tickets')).toBeTruthy();
    });

    it('should have accessibility label for book now button', () => {
      mockTicketsData = { pages: [] };

      const { getByLabelText } = render(<MyTicketScreen />);

      expect(getByLabelText('Book a movie ticket')).toBeTruthy();
    });

    it('should have accessibility label for pull to refresh', () => {
      const ticket = createMockTicket('1');
      mockTicketsData = { pages: [[ticket]] };

      const { getByLabelText } = render(<MyTicketScreen />);

      const list = getByLabelText(/Tickets list/);
      expect(list.props.refreshControl.props.accessibilityLabel).toBe(
        'Pull to refresh tickets',
      );
    });
  });

  describe('Tabs Display', () => {
    it('should render all tab options', () => {
      mockTicketsData = { pages: [] };

      const { getByText } = render(<MyTicketScreen />);

      expect(getByText('All')).toBeTruthy();
      expect(getByText('Active')).toBeTruthy();
      expect(getByText('Expired')).toBeTruthy();
    });
  });

  describe('Ticket with Missing Data', () => {
    it('should not render ticket without booking', () => {
      const ticket = {
        ...createMockTicket('1'),
        booking: undefined,
      } as unknown as Ticket;
      mockTicketsData = { pages: [[ticket]] };

      const { queryByText } = render(<MyTicketScreen />);

      expect(queryByText('Test Movie 1')).toBeNull();
    });

    it('should not render ticket without movie', () => {
      const ticket = createMockTicket('1');
      (ticket.booking!.showtime as any).movie = undefined;
      mockTicketsData = { pages: [[ticket]] };

      const { queryByText } = render(<MyTicketScreen />);

      expect(queryByText('Test Movie 1')).toBeNull();
    });

    it('should not render ticket without cinema', () => {
      const ticket = createMockTicket('1');
      (ticket.booking!.showtime!.cinemaHall as any).cinema = undefined;
      mockTicketsData = { pages: [[ticket]] };

      const { queryByText } = render(<MyTicketScreen />);

      expect(queryByText('Test Movie 1')).toBeNull();
    });
  });

  describe('Multiple Pages', () => {
    it('should flatten multiple pages of tickets', () => {
      const page1 = [createMockTicket('1'), createMockTicket('2')];
      const page2 = [createMockTicket('3'), createMockTicket('4')];
      mockTicketsData = { pages: [page1, page2] };

      const { getByText } = render(<MyTicketScreen />);

      expect(getByText('Test Movie 1')).toBeTruthy();
      expect(getByText('Test Movie 2')).toBeTruthy();
      expect(getByText('Test Movie 3')).toBeTruthy();
      expect(getByText('Test Movie 4')).toBeTruthy();
    });
  });
});
