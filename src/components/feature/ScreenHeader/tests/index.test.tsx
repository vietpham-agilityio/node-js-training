import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// Component
import { ScreenHeader } from '../';

// Type
import { ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Mock expo-router
const mockBack = jest.fn();
const mockCanGoBack = jest.fn();
const mockUsePathname = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    canGoBack: mockCanGoBack,
  }),
  usePathname: () => mockUsePathname(),
}));

// Mock uniwind
jest.mock('uniwind', () => ({
  useResolveClassNames: (classNames: string) => ({ className: classNames }),
  withUniwind: (Component: typeof Text) => Component,
}));

describe('ScreenHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanGoBack.mockReturnValue(true);
    mockUsePathname.mockReturnValue('/signup');
  });

  const headerProps = {
    options: {},
    route: { key: 'test', name: 'test' },
    navigation: {
      goBack: jest.fn(),
    } as unknown as NativeStackNavigationProp<ParamListBase, string, undefined>,
  };

  it('renders without crashing', () => {
    const { getByText } = render(<ScreenHeader {...headerProps} />);
    expect(getByText('Create New Your Account')).toBeTruthy();
  });

  it('displays title from HEADER_TITLE_MAP based on pathname', () => {
    mockUsePathname.mockReturnValue('/signup');
    const { getByText } = render(<ScreenHeader {...headerProps} />);
    expect(getByText('Create New Your Account')).toBeTruthy();
  });

  it('displays different title for different pathname', () => {
    mockUsePathname.mockReturnValue('/confirm-account');
    const { getByText } = render(<ScreenHeader {...headerProps} />);
    expect(getByText('Confirm New Account')).toBeTruthy();
  });

  it('displays custom title prop when provided', () => {
    const customTitle = 'Custom Title';
    const { getByText } = render(
      <ScreenHeader title={customTitle} {...headerProps} />,
    );
    expect(getByText(customTitle)).toBeTruthy();
  });

  it('hides back button when canGoBack returns false', () => {
    mockCanGoBack.mockReturnValue(false);
    const { queryByText } = render(<ScreenHeader {...headerProps} />);
    expect(queryByText('ArrowBackIcon')).toBeNull();
  });

  it('hides back button when showBackButton is false', () => {
    mockCanGoBack.mockReturnValue(true);
    const { queryByText } = render(
      <ScreenHeader showBackButton={false} {...headerProps} />,
    );
    expect(queryByText('ArrowBackIcon')).toBeNull();
  });

  it('renders custom left component when provided', () => {
    const customLeft = <Text>Custom Left</Text>;
    const { getByText, queryByText } = render(
      <ScreenHeader leftComponent={customLeft} {...headerProps} />,
    );

    expect(getByText('Custom Left')).toBeTruthy();
    expect(queryByText('ArrowBackIcon')).toBeNull();
  });

  it('renders custom right component when provided', () => {
    const customRight = <Text>Custom Right</Text>;
    const { getByText } = render(
      <ScreenHeader rightComponent={customRight} {...headerProps} />,
    );

    expect(getByText('Custom Right')).toBeTruthy();
  });

  it('renders both custom left and right components', () => {
    const customLeft = <Text>Custom Left</Text>;
    const customRight = <Text>Custom Right</Text>;

    const { getByText } = render(
      <ScreenHeader
        leftComponent={customLeft}
        rightComponent={customRight}
        {...headerProps}
      />,
    );

    expect(getByText('Custom Left')).toBeTruthy();
    expect(getByText('Custom Right')).toBeTruthy();
  });

  it('prioritizes title prop over HEADER_TITLE_MAP', () => {
    mockUsePathname.mockReturnValue('/signup');
    const customTitle = 'Override Title';
    const { getByText, queryByText } = render(
      <ScreenHeader title={customTitle} {...headerProps} />,
    );

    expect(getByText(customTitle)).toBeTruthy();
    expect(queryByText('Create New Your Account')).toBeNull();
  });
});
