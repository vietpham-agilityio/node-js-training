import { render, screen } from '@testing-library/react-native';

// Component
import { UserCard } from '../';

// Mock expo-image
jest.mock('expo-image', () => ({
  Image: 'Image',
}));

// Mock uniwind
jest.mock('uniwind', () => ({
  withUniwind: jest.fn((Component: any) => Component),
  useResolveClassNames: jest.fn(() => ({})),
}));

describe('UserCard Component', () => {
  const defaultProps = {
    imageUrl: 'https://example.com/profile.jpg',
    fullName: 'John C. Reilly',
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<UserCard {...defaultProps} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should display the user card', () => {
      render(<UserCard {...defaultProps} />);
      expect(screen.getByTestId('user-card')).toBeTruthy();
    });

    it('should display the profile image', () => {
      render(<UserCard {...defaultProps} />);
      expect(screen.getByTestId('user-card-image')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long names', () => {
      const longName = 'A'.repeat(50);
      render(
        <UserCard
          imageUrl="https://example.com/profile.jpg"
          fullName={longName}
        />,
      );
      expect(screen.getByText(longName.toUpperCase())).toBeTruthy();
    });
  });
});
