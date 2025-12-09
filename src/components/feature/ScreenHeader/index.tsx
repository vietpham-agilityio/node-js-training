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
    <View className="absolute top-0 left-0 right-0 z-10 bg-dark-blue">
      <View className="flex-row items-center justify-between px-4 py-4 min-h-16 pt-6">
        {/* Left Section */}
        <View className="flex-1 items-start">
          {leftComponent ||
            (showBackButton && router.canGoBack() && (
              <TouchableOpacity
                accessible
                accessibilityRole="button"
                accessibilityLabel="Go back"
                className="p-2"
                onPress={handleGoBack}
              >
                <ArrowBackIcon />
              </TouchableOpacity>
            ))}
        </View>

        {/* Center Section - Title */}
        <View
          accessible
          className="flex-2 items-center mt-12"
          accessibilityRole="header"
          accessibilityLabel={headerTitle}
        >
          <Typo size="2xl" weight="semibold" className="text-center">
            {headerTitle}
          </Typo>
        </View>

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
