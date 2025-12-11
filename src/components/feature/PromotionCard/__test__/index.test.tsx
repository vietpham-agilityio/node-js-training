import { render } from '@testing-library/react-native';

// Component
import { PromotionCard } from '../';

jest.mock('uniwind', () => {
  return {
    withUniwind: jest.fn((Component: any) => Component),
    useResolveClassNames: jest.fn(() => ({})),
  };
});

// Mock expo-image
jest.mock('expo-image', () => ({
  ImageBackground: 'ImageBackground',
}));

// Mock uniwind
jest.mock('uniwind', () => ({
  useResolveClassNames: (classNames: string) => ({ className: classNames }),
  withUniwind: (Component: typeof Text) => Component,
}));

describe('PromotionCard Component', () => {
  const defaultProps = {
    title: 'Student Holiday',
    subtitle: 'Maximal only for two people',
    discount: '50%',
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<PromotionCard {...defaultProps} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should display the title', () => {
      const { getByText } = render(<PromotionCard {...defaultProps} />);
      expect(getByText('Student Holiday')).toBeTruthy();
    });

    it('should display the subtitle', () => {
      const { getByText } = render(<PromotionCard {...defaultProps} />);
      expect(getByText('Maximal only for two people')).toBeTruthy();
    });

    it('should display the discount', () => {
      const { getByText } = render(<PromotionCard {...defaultProps} />);
      expect(getByText('50%')).toBeTruthy();
    });

    it('should display "OFF" text', () => {
      const { getByText } = render(<PromotionCard {...defaultProps} />);
      expect(getByText('OFF')).toBeTruthy();
    });
  });

  describe('Props', () => {
    it('should render with different title', () => {
      const { getByText } = render(
        <PromotionCard
          title="Summer Sale"
          subtitle="Special offer"
          discount="30%"
        />,
      );
      expect(getByText('Summer Sale')).toBeTruthy();
      expect(getByText('Special offer')).toBeTruthy();
      expect(getByText('30%')).toBeTruthy();
    });

    it('should render with different subtitle', () => {
      const { getByText } = render(
        <PromotionCard
          title="Winter Deal"
          subtitle="Limited time only"
          discount="25%"
        />,
      );
      expect(getByText('Winter Deal')).toBeTruthy();
      expect(getByText('Limited time only')).toBeTruthy();
    });

    it('should render with different discount', () => {
      const { getByText } = render(
        <PromotionCard
          title="Flash Sale"
          subtitle="Today only"
          discount="75%"
        />,
      );
      expect(getByText('75%')).toBeTruthy();
    });
  });
});
