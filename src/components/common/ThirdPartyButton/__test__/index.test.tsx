import { fireEvent, render } from '@testing-library/react-native';

// Component
import { ThirdPartyButton, ThirdPartyButtonType } from '../';

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => React.createElement(View, props, props.children),
    Svg: (props: any) =>
      React.createElement(View, { ...props, testID: 'svg' }, props.children),
    Path: (props: any) =>
      React.createElement(View, { ...props, testID: 'path' }),
    G: (props: any) => React.createElement(View, props, props.children),
    Defs: (props: any) => React.createElement(View, props, props.children),
    ClipPath: (props: any) => React.createElement(View, props, props.children),
    Rect: (props: any) =>
      React.createElement(View, { ...props, testID: 'rect' }),
  };
});

describe('ThirdPartyButton Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing with Facebook type', () => {
      const { root } = render(
        <ThirdPartyButton
          type={ThirdPartyButtonType.FACEBOOK}
          onPress={mockOnPress}
        />,
      );
      expect(root).toBeTruthy();
    });

    it('should render without crashing with Google type', () => {
      const { root } = render(
        <ThirdPartyButton
          type={ThirdPartyButtonType.GOOGLE}
          onPress={mockOnPress}
        />,
      );
      expect(root).toBeTruthy();
    });
  });

  describe('Icon Types', () => {
    it('should render with Facebook type icon', () => {
      const { getAllByTestId } = render(
        <ThirdPartyButton
          type={ThirdPartyButtonType.FACEBOOK}
          onPress={mockOnPress}
        />,
      );
      // Check if SVG paths are rendered (FacebookIcon has 1 path)
      const paths = getAllByTestId('path');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('should render with Google type icon', () => {
      const { getAllByTestId } = render(
        <ThirdPartyButton
          type={ThirdPartyButtonType.GOOGLE}
          onPress={mockOnPress}
        />,
      );
      // Check if SVG paths are rendered (GoogleIcon has multiple paths)
      const paths = getAllByTestId('path');
      expect(paths.length).toBeGreaterThan(1);
    });
  });

  describe('Interactions', () => {
    it('should call onPress when button is pressed', () => {
      const { root } = render(
        <ThirdPartyButton
          type={ThirdPartyButtonType.FACEBOOK}
          onPress={mockOnPress}
        />,
      );
      // Press the TouchableOpacity
      fireEvent.press(root);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should call onPress for Google button', () => {
      const { root } = render(
        <ThirdPartyButton
          type={ThirdPartyButtonType.GOOGLE}
          onPress={mockOnPress}
        />,
      );
      fireEvent.press(root);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should call onPress multiple times', () => {
      const { root } = render(
        <ThirdPartyButton
          type={ThirdPartyButtonType.FACEBOOK}
          onPress={mockOnPress}
        />,
      );
      fireEvent.press(root);
      fireEvent.press(root);
      fireEvent.press(root);
      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });
});
