import { render, screen } from '@testing-library/react-native';

// Component
import { UserCard } from '..';

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

    it('should display the full name', () => {
      render(<UserCard {...defaultProps} />);
      expect(screen.getByTestId('user-card-full-name')).toBeTruthy();
      expect(screen.getByText(defaultProps.fullName)).toBeTruthy();
    });

    it('should render with imageUrl when provided', () => {
      render(<UserCard {...defaultProps} />);
      const image = screen.getByTestId('user-card-image');
      expect(image).toBeTruthy();
      expect(image.props.source).toEqual({ uri: defaultProps.imageUrl });
    });

    it('should render with undefined source when imageUrl is not provided', () => {
      render(<UserCard fullName={defaultProps.fullName} />);
      const image = screen.getByTestId('user-card-image');
      expect(image).toBeTruthy();
      expect(image.props.source).toBeUndefined();
    });

    it('should render with undefined source when imageUrl is empty string', () => {
      render(<UserCard imageUrl="" fullName={defaultProps.fullName} />);
      const image = screen.getByTestId('user-card-image');
      expect(image).toBeTruthy();
      expect(image.props.source).toBeUndefined();
    });

    it('should apply custom className', () => {
      const customClassName = 'custom-class';
      const { getByTestId } = render(
        <UserCard {...defaultProps} className={customClassName} />,
      );
      const card = getByTestId('user-card');
      expect(card.props.className).toContain(customClassName);
    });

    it('should use default className when not provided', () => {
      const { getByTestId } = render(<UserCard {...defaultProps} />);
      const card = getByTestId('user-card');
      expect(card.props.className).toContain('items-center w-18 gap-2');
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility props', () => {
      const { getByTestId } = render(<UserCard {...defaultProps} />);
      const card = getByTestId('user-card');

      expect(card.props.accessible).toBe(true);
      expect(card.props.accessibilityRole).toBe('image');
      expect(card.props.accessibilityLabel).toBe(
        `User profile picture: ${defaultProps.fullName}`,
      );
    });

    it('should update accessibility label with different fullName', () => {
      const { getByTestId } = render(
        <UserCard {...defaultProps} fullName="Jane Doe" />,
      );
      const card = getByTestId('user-card');

      expect(card.props.accessibilityLabel).toBe(
        'User profile picture: Jane Doe',
      );
    });

    it('should have accessibilityIgnoresInvertColors on image', () => {
      render(<UserCard {...defaultProps} />);
      const image = screen.getByTestId('user-card-image');
      expect(image.props.accessibilityIgnoresInvertColors).toBe(true);
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
      expect(screen.getByText(longName)).toBeTruthy();
    });

    it('should handle empty fullName', () => {
      render(<UserCard fullName="" />);
      expect(screen.getByTestId('user-card-full-name')).toBeTruthy();
      expect(screen.getByText('')).toBeTruthy();
    });

    it('should handle names with special characters', () => {
      const specialName = "O'Brien-Smith & Co.";
      render(<UserCard {...defaultProps} fullName={specialName} />);
      expect(screen.getByText(specialName)).toBeTruthy();
    });

    it('should handle names with unicode characters', () => {
      const unicodeName = 'José María';
      render(<UserCard {...defaultProps} fullName={unicodeName} />);
      expect(screen.getByText(unicodeName)).toBeTruthy();
    });

    it('should handle imageUrl with special characters', () => {
      const specialUrl = 'https://example.com/profile?id=123&token=abc';
      render(
        <UserCard imageUrl={specialUrl} fullName={defaultProps.fullName} />,
      );
      const image = screen.getByTestId('user-card-image');
      expect(image.props.source).toEqual({ uri: specialUrl });
    });

    it('should handle null imageUrl (falsy value)', () => {
      render(
        <UserCard imageUrl={null as any} fullName={defaultProps.fullName} />,
      );
      const image = screen.getByTestId('user-card-image');
      expect(image.props.source).toBeUndefined();
    });
  });

  describe('Component Props', () => {
    it('should have correct displayName', () => {
      expect(UserCard.displayName).toBe('UserCard');
    });

    it('should be memoized', () => {
      const { rerender } = render(<UserCard {...defaultProps} />);
      const firstRender = screen.getByTestId('user-card');

      rerender(<UserCard {...defaultProps} />);
      const secondRender = screen.getByTestId('user-card');

      expect(firstRender).toBeTruthy();
      expect(secondRender).toBeTruthy();
    });

    it('should update when props change', () => {
      const { rerender } = render(<UserCard {...defaultProps} />);
      expect(screen.getByText(defaultProps.fullName)).toBeTruthy();

      rerender(<UserCard {...defaultProps} fullName="New Name" />);
      expect(screen.getByText('New Name')).toBeTruthy();
    });
  });

  describe('Image Configuration', () => {
    it('should configure image with correct props', () => {
      render(<UserCard {...defaultProps} />);
      const image = screen.getByTestId('user-card-image');

      expect(image.props.contentFit).toBe('cover');
      expect(image.props.transition).toBe(200);
      expect(image.props.className).toBe('w-18 h-18 rounded-base');
      expect(image.props.placeholder).toEqual({ blurhash: expect.any(String) });
    });

    it('should have placeholder blurhash when imageUrl is provided', () => {
      render(<UserCard {...defaultProps} />);
      const image = screen.getByTestId('user-card-image');
      expect(image.props.placeholder).toBeDefined();
      expect(image.props.placeholder.blurhash).toBeDefined();
    });

    it('should have placeholder blurhash when imageUrl is not provided', () => {
      render(<UserCard fullName={defaultProps.fullName} />);
      const image = screen.getByTestId('user-card-image');
      expect(image.props.placeholder).toBeDefined();
      expect(image.props.placeholder.blurhash).toBeDefined();
    });
  });
});
