import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Expo
import { Tabs } from 'expo-router';

// Constants
import { TABS } from '@/constants';

// Components
import { MainHeader } from '@/features/navigation/components/MainHeader';
import { NavigationTabBar } from '@/features/navigation/components/NavigationTabBar';

// Icons
import { HomeIcon } from '@/icons/HomeIcon';
import { TicketIcon } from '@/icons/TicketIcon';
import { WalletIcon } from '@/icons/WalletIcon';

const BOTTOM_TAB = [
  {
    title: TABS.HOME.TITLE,
    name: TABS.HOME.NAME,
    Icon: HomeIcon,
  },
  {
    title: TABS.WALLET.TITLE,
    name: TABS.WALLET.NAME,
    Icon: WalletIcon,
  },
  {
    title: TABS.MY_TICKET.TITLE,
    name: TABS.MY_TICKET.NAME,
    Icon: TicketIcon,
  },
];

const TabLayout = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      tabBar={props => (
        <NavigationTabBar bottomInset={insets.bottom} {...props} />
      )}
      screenOptions={{
        header: props => (
          <MainHeader
            isLeftTitle={props.route.name !== TABS.WALLET.NAME}
            isRenderUserProfile={props.route.name === TABS.HOME.NAME}
            topInset={insets.top}
            {...props}
          />
        ),
      }}
    >
      {BOTTOM_TAB.map(({ name, title }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: title,
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;
