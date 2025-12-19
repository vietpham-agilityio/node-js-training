import { render, screen } from '@testing-library/react-native';

// Component
import { Divider } from '../';

describe('Divider Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<Divider />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render with default testID', () => {
      render(<Divider />);
      expect(screen.getByTestId('divider')).toBeTruthy();
    });

    it('should have default styling', () => {
      render(<Divider />);
      const divider = screen.getByTestId('divider');
      expect(divider.props.className).toContain('h-0.5');
      expect(divider.props.className).toContain('border-grey');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(<Divider className="my-4" />);
      const divider = screen.getByTestId('divider');
      expect(divider.props.className).toContain('my-4');
    });

    it('should apply multiple custom classNames', () => {
      render(<Divider className="my-8 border-t border-grey" />);
      const divider = screen.getByTestId('divider');
      expect(divider.props.className).toContain('my-8');
      expect(divider.props.className).toContain('border-t');
      expect(divider.props.className).toContain('border-grey');
    });

    it('should merge default and custom className', () => {
      render(<Divider className="my-6" />);
      const divider = screen.getByTestId('divider');
      expect(divider.props.className).toContain('h-0.5');
      expect(divider.props.className).toContain('border-grey');
      expect(divider.props.className).toContain('my-6');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty className', () => {
      render(<Divider className="" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toBeTruthy();
    });
  });
});
