import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { useMemo } from 'react';
import { View } from 'react-native';

// Expo
import { usePathname } from 'expo-router';

// Components
import { Avatar, Typo } from '@/components/common';

// Constants
import { MAIN_TITLE_MAP } from '@/constants';

// Types
import { UserProfileIcon } from '@/icons';

// Utils
import { cn, STATUS_BAR_HEIGHT } from '@/utils';

export interface MainHeaderProps extends BottomTabHeaderProps {
  isLeftTitle?: boolean;
  isRenderUserProfile?: boolean;
}

export const MainHeader = ({
  isLeftTitle,
  isRenderUserProfile = true,
}: MainHeaderProps) => {
  const pathname = usePathname();

  const title = useMemo(
    () => MAIN_TITLE_MAP[pathname as keyof typeof MAIN_TITLE_MAP],
    [pathname],
  );

  return (
    <View
      className="absolute left-0 right-0 bg-bg-primary"
      style={{
        top: STATUS_BAR_HEIGHT,
      }}
    >
      <View className="flex-row items-center justify-between px-6 py-6">
        {/* Left Section */}
        <View
          accessible
          accessibilityRole="header"
          accessibilityLabel={title}
          className={cn('flex-1', isLeftTitle ? 'items-start' : 'items-center')}
        >
          <Typo
            size="2xl"
            weight="semibold"
            className={cn('leading-7', isLeftTitle && 'min-w-[198]')}
          >
            {title}
          </Typo>
        </View>

        {/* Right Section */}
        {isRenderUserProfile && (
          <View
            accessible
            className="flex-1 items-end"
            accessibilityLabel="Right section"
          >
            <Avatar
              size={48}
              variant="default"
              defaultAvatar={UserProfileIcon}
              accessibilityLabel="User profile picture"
            />
          </View>
        )}
      </View>
    </View>
  );
};

MainHeader.displayName = 'MainHeader';
