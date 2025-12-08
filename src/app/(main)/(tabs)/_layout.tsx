import { Tabs } from 'expo-router';

// Constants
import { TABS } from '@/constants';

const TabLayout = () => (
  <Tabs
    screenOptions={{
      headerShown: false,
    }}
  >
    <Tabs.Screen
      name={TABS.HOME.NAME}
      options={{
        title: TABS.HOME.TITLE,
      }}
    />
    <Tabs.Screen
      name={TABS.WALLET.NAME}
      options={{
        title: TABS.WALLET.TITLE,
      }}
    />
    <Tabs.Screen
      name={TABS.MY_TICKET.NAME}
      options={{
        title: TABS.MY_TICKET.TITLE,
      }}
    />
  </Tabs>
);

export default TabLayout;
