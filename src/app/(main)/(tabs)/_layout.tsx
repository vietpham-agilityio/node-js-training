import { View } from 'react-native';

// Expo
import { Tabs } from 'expo-router';

// Constants
import { TAB_BAR_THEME, TABS } from '@/constants';

// Components
import { MainHeader } from '@/components/feature';

// Icons
import { HomeIcon, TicketIcon, WalletIcon } from '@/icons';

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

const TabLayout = () => (
  <Tabs
    screenOptions={{
      tabBarStyle: {
        height: 90,
        borderTopWidth: 0,
        paddingBottom: 24,
        paddingTop: 20,
        backgroundColor: TAB_BAR_THEME.BACKGROUND_COLOR,
      },
      tabBarActiveTintColor: TAB_BAR_THEME.ACTIVE_COLOR,
      tabBarInactiveTintColor: TAB_BAR_THEME.INACTIVE_COLOR,
      tabBarLabelStyle: TAB_BAR_THEME.LABEL_STYLE,
      tabBarItemStyle: {
        position: 'relative',
      },
      header: props => (
        <MainHeader
          isLeftTitle={props.route.name !== TABS.WALLET.NAME}
          isRenderUserProfile={props.route.name === TABS.HOME.NAME}
          {...props}
        />
      ),
    }}
  >
    {BOTTOM_TAB.map(({ name, title, Icon }) => (
      <Tabs.Screen
        key={name}
        name={name}
        options={{
          title: title,
          tabBarIcon: ({ color, focused, size = TAB_BAR_THEME.ICON_SIZE }) => (
            <>
              {focused && (
                <View
                  style={{
                    position: 'absolute',
                    top: -25,
                    left: -6,
                    right: 0,
                    height: 3,
                    backgroundColor: TAB_BAR_THEME.ACTIVE_BORDER_COLOR,
                    borderRadius: 2,
                  }}
                />
              )}
              <Icon
                className="items-center justify-center"
                width={size}
                height={size}
                color={color}
              />
            </>
          ),
        }}
      />
    ))}
  </Tabs>
);

export default TabLayout;
