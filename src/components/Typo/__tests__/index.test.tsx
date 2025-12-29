import { render } from '@testing-library/react-native';
import React from 'react';

// Component
import { Typo } from '..';

describe('Typo Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = render(<Typo>Test Text</Typo>);
      expect(getByText('Test Text')).toBeTruthy();
    });

    it('should display the correct children text', () => {
      const { getByText } = render(<Typo>Hello World</Typo>);
      expect(getByText('Hello World')).toBeTruthy();
    });

    it('should render with testID', () => {
      const { getByTestId } = render(<Typo testID="test-typo">Text</Typo>);
      expect(getByTestId('test-typo')).toBeTruthy();
    });

    it('should have default white text color', () => {
      const { getByText } = render(<Typo>Default Color</Typo>);
      const element = getByText('Default Color');
      expect(element.props.className).toContain('text-white');
    });

    it('should have accessibility role text', () => {
      const { getByText } = render(<Typo>Accessible Text</Typo>);
      const element = getByText('Accessible Text');
      expect(element.props.accessibilityRole).toBe('text');
    });
  });

  describe('Font Sizes', () => {
    it('should render with default base size', () => {
      const { getByText } = render(<Typo>Default Size</Typo>);
      const element = getByText('Default Size');
      expect(element.props.className).toContain('text-base');
    });

    it('should render with 3xs size', () => {
      const { getByText } = render(<Typo size="3xs">Tiny Text</Typo>);
      const element = getByText('Tiny Text');
      expect(element.props.className).toContain('text-3xs');
    });

    it('should render with 2xs size', () => {
      const { getByText } = render(<Typo size="2xs">Extra Small</Typo>);
      const element = getByText('Extra Small');
      expect(element.props.className).toContain('text-2xs');
    });

    it('should render with xs size', () => {
      const { getByText } = render(<Typo size="xs">Small</Typo>);
      const element = getByText('Small');
      expect(element.props.className).toContain('text-xs');
    });

    it('should render with sm size', () => {
      const { getByText } = render(<Typo size="sm">Small Medium</Typo>);
      const element = getByText('Small Medium');
      expect(element.props.className).toContain('text-sm');
    });

    it('should render with lg size', () => {
      const { getByText } = render(<Typo size="lg">Large</Typo>);
      const element = getByText('Large');
      expect(element.props.className).toContain('text-lg');
    });

    it('should render with xl size', () => {
      const { getByText } = render(<Typo size="xl">Extra Large</Typo>);
      const element = getByText('Extra Large');
      expect(element.props.className).toContain('text-xl');
    });

    it('should render with 2xl size', () => {
      const { getByText } = render(<Typo size="2xl">2X Large</Typo>);
      const element = getByText('2X Large');
      expect(element.props.className).toContain('text-2xl');
    });
  });

  describe('Font Weights', () => {
    it('should render with default regular weight', () => {
      const { getByText } = render(<Typo>Regular Weight</Typo>);
      const element = getByText('Regular Weight');
      expect(element.props.className).toContain('font-montserrat-regular');
    });

    it('should render with light weight', () => {
      const { getByText } = render(<Typo weight="light">Light Weight</Typo>);
      const element = getByText('Light Weight');
      expect(element.props.className).toContain('font-montserrat-light');
    });

    it('should render with medium weight', () => {
      const { getByText } = render(<Typo weight="medium">Medium Weight</Typo>);
      const element = getByText('Medium Weight');
      expect(element.props.className).toContain('font-montserrat-medium');
    });

    it('should render with semibold weight', () => {
      const { getByText } = render(
        <Typo weight="semibold">SemiBold Weight</Typo>,
      );
      const element = getByText('SemiBold Weight');
      expect(element.props.className).toContain('font-montserrat-semibold');
    });
  });

  describe('Custom ClassName', () => {
    it('should combine multiple classNames', () => {
      const { getByText } = render(
        <Typo className="italic text-center">Custom Classes</Typo>,
      );
      const element = getByText('Custom Classes');
      expect(element.props.className).toContain('italic');
      expect(element.props.className).toContain('text-center');
    });

    it('should override text color with className', () => {
      const { getByText } = render(
        <Typo className="text-blue-500">Blue Text</Typo>,
      );
      const element = getByText('Blue Text');
      expect(element.props.className).toContain('text-blue-500');
    });
  });

  describe('Combined Props', () => {
    it('should render with size and weight combined', () => {
      const { getByText } = render(
        <Typo size="xl" weight="semibold">
          Combined Props
        </Typo>,
      );

      const element = getByText('Combined Props');
      expect(element.props.className).toContain('text-xl');
      expect(element.props.className).toContain('font-montserrat-semibold');
      expect(element.props.className).toContain('text-white');
    });

    it('should render with all props combined', () => {
      const { getByText, getByTestId } = render(
        <Typo
          size="lg"
          weight="medium"
          className="text-center"
          testID="combined-typo"
        >
          All Props
        </Typo>,
      );

      const element = getByText('All Props');
      expect(element.props.className).toContain('text-lg');
      expect(element.props.className).toContain('font-montserrat-medium');
      expect(element.props.className).toContain('text-center');
      expect(getByTestId('combined-typo')).toBeTruthy();
    });
  });

  describe('Children Types', () => {
    it('should render string children', () => {
      const { getByText } = render(<Typo>String Text</Typo>);
      expect(getByText('String Text')).toBeTruthy();
    });

    it('should render number children', () => {
      const { getByText } = render(<Typo>{123}</Typo>);
      expect(getByText('123')).toBeTruthy();
    });

    it('should render with long text', () => {
      const longText =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
      const { getByText } = render(<Typo>{longText}</Typo>);
      expect(getByText(longText)).toBeTruthy();
    });
  });
});
