import { memo } from 'react';
import { View } from 'react-native';

// Expo
import { Image } from 'expo-image';

// Unwind
import { withUniwind } from 'uniwind';

// Constants
import { BLUR_HASH } from '@/constants';

// Components
import { Typo } from '@/components/Typo';

interface UserCardProps {
  imageUrl?: string;
  fullName: string;
  className?: string;
}

const StyledImage = withUniwind(Image);

export const UserCard = memo(
  ({ imageUrl, fullName, className = '' }: UserCardProps) => (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`User profile picture: ${fullName}`}
      testID="user-card"
      className={`items-center w-18 gap-2 ${className}`}
    >
      {/* Profile Picture */}
      <View className="relative">
        <StyledImage
          source={imageUrl ? { uri: imageUrl } : undefined}
          contentFit="cover"
          transition={200}
          accessibilityIgnoresInvertColors
          className="w-18 h-18 rounded-base"
          testID="user-card-image"
          placeholder={{
            blurhash: BLUR_HASH,
          }}
        />
      </View>

      {/* User Name */}
      <View className="px-2">
        <Typo
          size="xs"
          weight="regular"
          className="text-center"
          testID="user-card-full-name"
        >
          {fullName}
        </Typo>
      </View>
    </View>
  ),
);

UserCard.displayName = 'UserCard';
