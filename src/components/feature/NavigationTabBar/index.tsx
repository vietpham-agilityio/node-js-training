import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ComponentType, memo } from 'react';
import { Pressable, View } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { useResolveClassNames } from 'uniwind';

// Constants
import { NAVIGATION_BOTTOM_TABS, TAB_BAR_THEME } from '@/constants';

// Utils
import { cn, isIOS } from '@/utils';

// Components
import { Typo } from '@/components/common';

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

    const handleOnPress = (
      isDisabled = false,
      isFocused: boolean,
      routeKey: string,
      routeName: string,
    ) => {
      // Check if route is disabled
      if (isDisabled) {
        return; // Don't navigate
      }

      const event = navigation.emit({
        type: 'tabPress',
        target: routeKey,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    };

    const handleOnLongPress = (isDisabled = false, routeKey: string) => {
      // Check if route is disabled
      if (isDisabled) {
        return;
      }

      navigation.emit({
        type: 'tabLongPress',
        target: routeKey,
      });
    };

    const renderTabBarIcon = (
      Icon: ComponentType<SvgProps>,
      focused = false,
      disabled = false,
      size = 24,
    ) => {
      const color = disabled
        ? colorIconInActive.color
        : focused
          ? colorActive.color
          : colorIconInActive.color;

      return (
        <Icon
          width={size}
          height={size}
          color={color}
          testID={`icon-${Icon.name}-${focused}-${disabled}`}
        />
      );
    };

    return (
      <View
        className={cn(`flex-row border-0`, isIOS() && 'shadow-md')}
        accessibilityLabel="Main navigation tabs"
        accessibilityHint="Tap to select a tab"
        style={{
          backgroundColor: TAB_BAR_THEME.BACKGROUND_COLOR,
          paddingBottom: bottomInset,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const tabConfig = Object.values(NAVIGATION_BOTTOM_TABS).find(
            tab => tab.NAME === route.name,
          );

          if (!tabConfig) return null; // Skip if no config found

          const label = options.title || route.name;
          const isFocused = state.index === index;
          const isDisabled = disabledRoutes?.includes(route.name);

          const onPress = () =>
            handleOnPress(isDisabled, isFocused, route.key, route.name);

          const onLongPress = () => handleOnLongPress(isDisabled, route.key);

          // Get icon name based on route
          const IconComponent = isFocused
            ? tabConfig.ICON
            : tabConfig.ICON_INACTIVE;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused, disabled: isDisabled }}
              accessibilityLabel={options.tabBarAccessibilityLabel || label}
              accessibilityHint={`Navigates to the ${label} screen`}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center justify-center pt-5 gap-0.5"
              disabled={isDisabled}
            >
              {renderTabBarIcon(IconComponent, isFocused)}
              <Typo
                weight="medium"
                size="3xs"
                className={cn(
                  'text-text-white/70',
                  isFocused && 'text-text-white',
                )}
              >
                {label}
              </Typo>
              {isFocused && (
                <View
                  testID={`tab-indicator-${route.key}`}
                  className="absolute top-0 right-0 h-0.5 w-11 left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    backgroundColor: TAB_BAR_THEME.ACTIVE_BORDER_COLOR,
                  }}
                  accessible={false}
                  importantForAccessibility="no"
                />
              )}
            </Pressable>
          );
        })}
      </View>
    );
  },
);

NavigationTabBar.displayName = 'NavigationTabBar';
