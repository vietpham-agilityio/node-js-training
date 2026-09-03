import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { memo } from 'react';
import { View } from 'react-native';
import { useResolveClassNames } from 'uniwind';

// Utils
import { cn } from '@/utils/cn';
import { isIOS } from '@/utils/platform';

// Components
import { TabBarItem } from './TabBarItem';

type CustomTabBarProps = BottomTabBarProps & {
  disabledRoutes?: string[];
  bottomInset?: number;
};

export const NavigationTabBar = memo(
  ({
    disabledRoutes,
    state,
    descriptors,
    navigation,
    bottomInset = 24,
  }: CustomTabBarProps) => {
    const colorIconInActive = useResolveClassNames('text-text-alternative');
    const colorActive = useResolveClassNames('text-text-white');

    return (
      <View
        className={cn(`flex-row border-0 bg-deep-blue`, isIOS() && 'shadow-md')}
        accessibilityLabel="Main navigation tabs"
        accessibilityHint="Tap to select a tab"
        style={{
          paddingBottom: bottomInset + 16,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key] || {};
          const isFocused = state.index === index;
          const isDisabled = disabledRoutes?.includes(route.name);

          return (
            <TabBarItem
              key={route.key}
              route={route}
              options={options || {}}
              isFocused={isFocused}
              isDisabled={isDisabled}
              navigation={navigation}
              colorActive={colorActive.color}
              colorInactive={colorIconInActive.color}
            />
          );
        })}
      </View>
    );
  },
);

NavigationTabBar.displayName = 'NavigationTabBar';
