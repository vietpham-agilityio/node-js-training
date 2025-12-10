import { useMemo } from 'react';
import { View } from 'react-native';

// Expo
import { usePathname } from 'expo-router';

// Components
import { Avatar, Typo } from '@/components/common';

// Constants
import { MAIN_TITLE_MAP } from '@/constants';

// Types
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';

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

  const textPosition = useMemo(
    () => (isLeftTitle ? 'items-start' : 'items-center'),
    [isLeftTitle],
  );

  return (
    <View className="absolute top-0 left-0 right-0 z-10 bg-dark-blue">
      <View className="flex-row items-center justify-between px-4 py-4 min-h-16 pt-18">
        {/* Left Section */}
        <View
          accessible
          accessibilityRole="header"
          accessibilityLabel={title}
          className={`flex-1 ${textPosition}`}
        >
          <Typo size="2xl" weight="semibold">
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
              accessibilityLabel="User profile picture"
            />
          </View>
        )}
      </View>
    </View>
  );
};

MainHeader.displayName = 'MainHeader';
