import { ReactNode } from 'react';
import { TouchableOpacity, View } from 'react-native';

// Expo
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { usePathname, useRouter } from 'expo-router';

// Components
import { Typo } from '@/components/common';

// Icons
import { ArrowBackIcon } from '@/icons';

// Constants
import { HEADER_TITLE_MAP } from '@/constants';
import { STATUS_BAR_HEIGHT } from '@/utils';

export interface ScreenHeaderProps extends NativeStackHeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightComponent?: ReactNode;
  leftComponent?: ReactNode;
}

export const ScreenHeader = ({
  title,
  showBackButton = true,
  rightComponent,
  leftComponent,
}: ScreenHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();

  // Map pathname to header title from HEADER_TITLE_MAP
  const headerTitle =
    title || HEADER_TITLE_MAP[pathname as keyof typeof HEADER_TITLE_MAP];

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View
      className="absolute left-0 right-0 bg-dark-blue "
      style={{
        top: STATUS_BAR_HEIGHT,
      }}
    >
      <View className="flex-row items-center justify-between px-6 py-6">
        {/* Left Section */}
        <View className="flex-1 items-start">
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
            className="flex-2 items-center mt-12"
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
