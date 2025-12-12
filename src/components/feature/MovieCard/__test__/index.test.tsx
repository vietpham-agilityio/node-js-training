import { render, screen } from '@testing-library/react-native';

// Component
import { MovieCard } from '../';

// Constants
import { Size } from '@/constants';

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('uniwind', () => ({
  withUniwind: jest.fn((Component: any) => Component),
  useResolveClassNames: jest.fn(() => ({})),
}));

describe('MovieCard Component', () => {
  const defaultProps = {
    title: 'Test Movie',
    posterUrl: 'https://example.com/poster.jpg',
    durationMinutes: 120,
    genre: ['Action', 'Comedy'],
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<MovieCard {...defaultProps} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should display the movie title', () => {
      render(<MovieCard {...defaultProps} />);
      expect(screen.getByText('Test Movie')).toBeTruthy();
    });

    it('should display the movie poster', () => {
      render(<MovieCard {...defaultProps} />);
      expect(screen.getByTestId('movie-card-poster')).toBeTruthy();
    });
  });

  describe('Detailed Info Mode (Default)', () => {
    it('should display rating when provided', () => {
      render(<MovieCard {...defaultProps} rating={4.5} />);
      expect(screen.getByTestId('movie-card-rating')).toBeTruthy();
    });

    it('should display genres', () => {
      render(<MovieCard {...defaultProps} />);
      expect(screen.getByText('Action, Comedy')).toBeTruthy();
    });

    it('should display duration', () => {
      render(<MovieCard {...defaultProps} durationMinutes={120} />);
      expect(screen.getByText('2h')).toBeTruthy();
    });

    it('should not display rating when not provided', () => {
      render(<MovieCard {...defaultProps} />);
      expect(screen.queryByTestId('movie-card-rating')).toBeNull();
    });

    it('should not display booking info when not provided', () => {
      render(<MovieCard {...defaultProps} />);
      expect(screen.queryByTestId('movie-card-showtime')).toBeNull();
      expect(screen.queryByTestId('movie-card-price')).toBeNull();
      expect(screen.queryByTestId('movie-card-cinema')).toBeNull();
    });
  });

  describe('Booking Info Mode', () => {
    it('should display showtime and date when provided', () => {
      render(
        <MovieCard {...defaultProps} showtime="16:40" showDate="Sun May 22" />,
      );
      expect(screen.getByText('16:40, Sun May 22')).toBeTruthy();
    });

    it('should display price when provided', () => {
      render(<MovieCard {...defaultProps} price="150.000" />);
      expect(screen.getByText('IDR: 150.000')).toBeTruthy();
    });

    it('should display cinema location when provided', () => {
      render(<MovieCard {...defaultProps} cinemaLocation="FX Sudirman XXI" />);
      expect(screen.getByText('FX Sudirman XXI')).toBeTruthy();
    });

    it('should display all booking info together', () => {
      render(
        <MovieCard
          {...defaultProps}
          showtime="16:40"
          showDate="Sun May 22"
          price="150.000"
          cinemaLocation="FX Sudirman XXI"
        />,
      );
      expect(screen.getByText('16:40, Sun May 22')).toBeTruthy();
      expect(screen.getByText('IDR: 150.000')).toBeTruthy();
      expect(screen.getByText('FX Sudirman XXI')).toBeTruthy();
    });

    it('should not display rating when booking info is present', () => {
      render(
        <MovieCard
          {...defaultProps}
          rating={4.5}
          showtime="16:40"
          showDate="Sun May 22"
        />,
      );
      expect(screen.queryByTestId('movie-card-rating')).toBeNull();
    });

    it('should not display genres and duration when booking info is present', () => {
      render(
        <MovieCard {...defaultProps} showtime="16:40" showDate="Sun May 22" />,
      );
      expect(screen.queryByText('Action, Comedy')).toBeNull();
      expect(screen.queryByText('2h')).toBeNull();
    });
  });

  describe('Image Sizes', () => {
    it('should render with small image size', () => {
      const { toJSON } = render(
        <MovieCard {...defaultProps} imageSize={Size.SMALL} />,
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should render with medium image size', () => {
      const { toJSON } = render(
        <MovieCard {...defaultProps} imageSize={Size.MEDIUM} />,
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should render with large image size', () => {
      const { toJSON } = render(
        <MovieCard {...defaultProps} imageSize={Size.LARGE} />,
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty genre array', () => {
      render(<MovieCard {...defaultProps} genre={[]} />);
      expect(screen.getByText('Test Movie')).toBeTruthy();
    });

    it('should handle zero duration', () => {
      render(<MovieCard {...defaultProps} durationMinutes={0} />);
      expect(screen.getByText('Test Movie')).toBeTruthy();
    });

    it('should handle showtime only without date', () => {
      render(<MovieCard {...defaultProps} showtime="16:40" />);
      expect(screen.getByText('16:40')).toBeTruthy();
    });

    it('should handle date only without showtime', () => {
      render(<MovieCard {...defaultProps} showDate="Sun May 22" />);
      expect(screen.getByText('Sun May 22')).toBeTruthy();
    });

    it('should handle only price without other booking info', () => {
      render(<MovieCard {...defaultProps} price="150.000" />);
      expect(screen.getByText('IDR: 150.000')).toBeTruthy();
      expect(screen.queryByTestId('movie-card-showtime')).toBeNull();
      expect(screen.queryByTestId('movie-card-cinema')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label', () => {
      render(<MovieCard {...defaultProps} />);
      const card = screen.getByTestId('movie-card');
      expect(card.props.accessibilityLabel).toBe('Test Movie');
    });
  });
});
