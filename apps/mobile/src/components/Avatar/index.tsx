import { ComponentType, memo } from 'react';
import { View } from 'react-native';
import { SvgProps } from 'react-native-svg';

// SDKs
import { Image } from 'expo-image';

// Constants
import { BLUR_HASH } from '@/constants';

// Icons
import { PhotoProfileIcon } from '@/icons/PhotoProfileIcon';

// Utils
import { cn } from '@/utils/cn';

type Size = 48 | 92 | 132 | 160;

export interface AvatarProps {
  size?: Size;
  source?: string | null;
  defaultAvatar?: ComponentType<SvgProps>;
  accessibilityLabel?: string;
  className?: string;
}

// Size configurations mapping
const SIZE_MAP: Record<Size, { container: string; avatar: string }> = {
  48: {
    container: 'w-12 h-12',
    avatar: 'w-12 h-12',
  },
  92: {
    container: 'w-23 h-23',
    avatar: 'w-23 h-23',
  },
  132: {
    container: 'w-33 h-33',
    avatar: 'w-33 h-33',
  },
  160: {
    container: 'w-40 h-40',
    avatar: 'w-40 h-40',
  },
};

export const Avatar = memo(
  ({
    size = 92,
    source,
    defaultAvatar,
    accessibilityLabel,
    className = '',
  }: AvatarProps) => {
    const config = SIZE_MAP[size];
    const DefaultAvatar = defaultAvatar || PhotoProfileIcon;

    const defaultAvatarLabel = accessibilityLabel || 'Profile picture';

    return (
      <View
        testID="avatar-container"
        className={cn('relative', config.container, className)}
        accessible={true}
        accessibilityLabel={defaultAvatarLabel}
        accessibilityRole="image"
      >
        {source ? (
          <Image
            source={{ uri: source }}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: BLUR_HASH }}
            accessible={true}
            accessibilityLabel={accessibilityLabel || 'Profile picture'}
            accessibilityRole="image"
            accessibilityIgnoresInvertColors
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 9999,
            }}
          />
        ) : (
          <View
            testID="default-avatar-icon"
            className={cn(
              config.avatar,
              'rounded-full items-center justify-center overflow-hidden',
            )}
            accessible
            accessibilityLabel={defaultAvatarLabel}
            accessibilityRole="image"
            accessibilityHint="Default avatar placeholder"
          >
            <View
              className="items-center justify-center w-full h-full"
              importantForAccessibility="no-hide-descendants"
            >
              <DefaultAvatar width={size} height={size} />
            </View>
          </View>
        )}
      </View>
    );
  },
);

Avatar.displayName = 'Avatar';
