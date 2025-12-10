import { render } from '@testing-library/react-native';

// Component
import { MainHeader } from '../';

// Type
import { type ParamListBase } from '@react-navigation/native';
import { type Layout } from '@react-navigation/elements';
import { type BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Mock expo-router
const mockUsePathname = jest.fn();

jest.mock('expo-router', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('MainHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  const headerProps = {
    options: {},
    route: { key: 'test', name: 'test' },
    layout: {} as unknown as Layout,
    navigation: {} as unknown as BottomTabNavigationProp<
      ParamListBase,
      string,
      undefined
    >,
  };

  it('renders without crashing', () => {
    const { getByText } = render(<MainHeader {...headerProps} />);
    expect(getByText('Find Your Best Movie')).toBeTruthy();
  });

  it('displays title from MAIN_TITLE_MAP based on pathname', () => {
    mockUsePathname.mockReturnValue('/');
    const { getByText } = render(<MainHeader {...headerProps} />);
    expect(getByText('Find Your Best Movie')).toBeTruthy();
  });

  it('displays different title for different pathname', () => {
    mockUsePathname.mockReturnValue('/wallet');
    const { getByText } = render(<MainHeader {...headerProps} />);
    expect(getByText('My Wallet')).toBeTruthy();
  });

  it('displays title for my-ticket pathname', () => {
    mockUsePathname.mockReturnValue('/my-ticket');
    const { getByText } = render(<MainHeader {...headerProps} />);
    expect(getByText('My Ticket')).toBeTruthy();
  });

  it('applies left alignment when isLeftTitle is true', () => {
    mockUsePathname.mockReturnValue('/');
    const { getByLabelText } = render(
      <MainHeader isLeftTitle {...headerProps} />,
    );
    const headerView = getByLabelText('Find Your Best Movie');
    expect(headerView).toBeTruthy();
  });

  it('applies center alignment when isLeftTitle is false', () => {
    mockUsePathname.mockReturnValue('/');
    const { getByLabelText } = render(
      <MainHeader isLeftTitle={false} {...headerProps} />,
    );
    const headerView = getByLabelText('Find Your Best Movie');
    expect(headerView).toBeTruthy();
  });
});
