import { render, screen } from '@testing-library/react-native';

// Components
import { TicketDetailSkeleton } from '../';

describe('TicketDetailSkeleton', () => {
  describe('Rendering', () => {
    it('should render the skeleton container', () => {
      render(<TicketDetailSkeleton />);

      expect(screen.getByTestId('ticket-detail-skeleton')).toBeTruthy();
    });

    it('should have correct accessibility label', () => {
      render(<TicketDetailSkeleton />);

      expect(screen.getByLabelText('Loading ticket details')).toBeTruthy();
    });
  });

  describe('Movie Card Skeleton', () => {
    it('should render horizontal card skeleton', () => {
      const { getByTestId } = render(<TicketDetailSkeleton />);

      expect(getByTestId('horizontal-card-skeleton')).toBeTruthy();
    });
  });

  describe('Order Details Skeletons', () => {
    it('should render all 6 detail row skeletons', () => {
      render(<TicketDetailSkeleton />);

      for (let i = 0; i < 6; i++) {
        expect(
          screen.getByTestId(`ticket-detail-skeleton-row-${i}`),
        ).toBeTruthy();
        expect(
          screen.getByTestId(`ticket-detail-skeleton-label-${i}`),
        ).toBeTruthy();
        expect(
          screen.getByTestId(`ticket-detail-skeleton-value-${i}`),
        ).toBeTruthy();
      }
    });

    it('should render label skeletons with correct accessibility label', () => {
      render(<TicketDetailSkeleton />);

      const labelSkeletons = screen.getAllByLabelText('Loading label');
      expect(labelSkeletons).toHaveLength(6);
    });

    it('should render value skeletons with correct accessibility label', () => {
      render(<TicketDetailSkeleton />);

      const valueSkeletons = screen.getAllByLabelText('Loading value');
      expect(valueSkeletons).toHaveLength(6);
    });
  });

  describe('QR Code Section', () => {
    it('should render QR code skeleton', () => {
      const { getByTestId } = render(<TicketDetailSkeleton />);

      expect(getByTestId('ticket-detail-skeleton-qr')).toBeTruthy();
    });

    it('should render QR code skeleton with correct accessibility label', () => {
      const { getByLabelText } = render(<TicketDetailSkeleton />);

      expect(getByLabelText('Loading QR code')).toBeTruthy();
    });

    it('should render ID order label skeleton', () => {
      const { getByTestId } = render(<TicketDetailSkeleton />);

      expect(getByTestId('ticket-detail-skeleton-id-label')).toBeTruthy();
    });

    it('should render ID order value skeleton', () => {
      const { getByTestId } = render(<TicketDetailSkeleton />);

      expect(getByTestId('ticket-detail-skeleton-id-value')).toBeTruthy();
    });

    it('should render ID order skeletons with correct accessibility labels', () => {
      render(<TicketDetailSkeleton />);

      expect(screen.getByLabelText('Loading ID order label')).toBeTruthy();
      expect(screen.getByLabelText('Loading ID order value')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should render all skeleton elements', () => {
      render(<TicketDetailSkeleton />);

      expect(screen.getByTestId('ticket-detail-skeleton')).toBeTruthy();
      expect(screen.getByTestId('horizontal-card-skeleton')).toBeTruthy();
      expect(screen.getByTestId('ticket-detail-skeleton-qr')).toBeTruthy();
      expect(
        screen.getByTestId('ticket-detail-skeleton-id-label'),
      ).toBeTruthy();
      expect(
        screen.getByTestId('ticket-detail-skeleton-id-value'),
      ).toBeTruthy();
    });
  });
});
