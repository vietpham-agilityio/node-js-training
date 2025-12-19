import { ReactNode } from 'react';
import { TouchableOpacity, View } from 'react-native';

// Expo
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { usePathname, useRouter } from 'expo-router';

// Components
import { Typo } from '../Typo';

// Icons
import { ArrowBackIcon } from '@/icons';

// Constants

// Utils
import {
  cn,
  getHeaderTitle,
  isScreenPathname,
  STATUS_BAR_HEIGHT,
} from '@/utils';

// Stores
import { ROUTES, SCREENS } from '@/constants';
import { useHeaderStore } from '@/stores/header';

export interface ScreenHeaderProps extends NativeStackHeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightComponent?: ReactNode;
  leftComponent?: ReactNode;
  topInset?: number;
}

export const ScreenHeader = ({
  title,
  showBackButton = true,
  rightComponent,
  leftComponent,
  topInset = STATUS_BAR_HEIGHT,
}: ScreenHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();

  // Dynamic header title from store
  const headerStoreTitle = useHeaderStore(state => state.title);

  // Map pathname to header title from HEADER_TITLE_MAP
  const headerTitle = title || getHeaderTitle(pathname) || headerStoreTitle;
  const isProfileScreen = isScreenPathname(pathname, SCREENS.MAIN.PROFILE);

  const handleGoBack = () => {
    if (isProfileScreen) {
      return router.replace(ROUTES.HOME);
    }

    router.back();
  };

  return (
    <View className="bg-bg-primary" style={{ paddingTop: topInset }}>
      <View className="flex-row justify-between px-6 py-6">
        {/* Left Section */}
        <View className={cn('flex-1 items-start')}>
          {leftComponent ||
            (showBackButton && router.canGoBack() && (
              <TouchableOpacity
                accessible
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={handleGoBack}
              >
                <ArrowBackIcon width={20} height={20} />
              </TouchableOpacity>
            ))}
        </View>

        {/* Center Section - Title */}
        {headerTitle && (
          <View
            accessible
            className="w-46 items-center"
            accessibilityRole="header"
            accessibilityLabel={headerTitle}
          >
            <Typo
              size="2xl"
              weight="semibold"
              className="leading-7 text-center"
            >
              {headerTitle}
            </Typo>
          </View>
        )}

        {/* Right Section */}
        <View
          accessible
          className="flex-1 items-end"
          accessibilityLabel="Right section"
        >
          {rightComponent}
        </View>
      </View>
    </View>
  );
};

ScreenHeader.displayName = 'ScreenHeader';
