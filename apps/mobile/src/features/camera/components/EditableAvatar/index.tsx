import { Platform, TouchableOpacity, View } from 'react-native';

// Utils
import { cn } from '@/utils/cn';

// Icons
import { AddIcon } from '@/icons/AddIcon';
import { CancelIcon } from '@/icons/CancelIcon';

// Components
import { Avatar, AvatarProps } from '@/components/Avatar';

// HOCs
import {
  AvatarStateInjectedProps,
  withAvatarState,
} from '../../hocs/withAvatarState';
import {
  CameraOptionInjectedProps,
  withCameraOption,
} from '../../hocs/withCameraOptions';

type Size = 48 | 92 | 132 | 160;

interface EditableAvatarBaseProps extends AvatarProps {
  size?: Size;
  accessibilityHint?: string;
}

// Button size configurations
const BUTTON_SIZE_MAP: Record<
  Size,
  {
    button: string;
    buttonPosition: string;
    iconSize: number;
  }
> = {
  48: {
    button: 'w-6 h-6',
    buttonPosition: 'bottom-0',
    iconSize: 24,
  },
  92: {
    button: 'w-7 h-7',
    buttonPosition: '-bottom-3.5',
    iconSize: 24,
  },
  132: {
    button: 'w-10 h-10',
    buttonPosition: 'bottom-0',
    iconSize: 24,
  },
  160: {
    button: 'w-12 h-12',
    buttonPosition: 'bottom-0',
    iconSize: 24,
  },
};

/**
 * Base EditableAvatar component with picker button
 * Wraps Avatar component with an overlay button
 */
const EditableAvatarBase = ({
  size = 92,
  accessibilityHint,
  // From withAvatarState
  avatarUri,
  removeAvatar,
  hasAvatar,
  // From withCameraOption
  openCameraOptions,
  isSelectingImage,
  // Other Avatar props
  ...avatarProps
}: EditableAvatarBaseProps &
  AvatarStateInjectedProps &
  CameraOptionInjectedProps) => {
  const buttonConfig = BUTTON_SIZE_MAP[size];

  // Accessibility labels
  const pickerButtonLabel = hasAvatar
    ? 'Remove profile picture'
    : 'Add profile picture';
  const pickerButtonHint =
    accessibilityHint ||
    (hasAvatar
      ? 'Tap to remove your profile picture'
      : 'Tap to select a profile picture');

  /**
   * Handle button press
   */
  const handleButtonPress = () => {
    if (hasAvatar) {
      removeAvatar();
    } else {
      openCameraOptions();
    }
  };

  return (
    <View className="relative items-center justify-center">
      {/* Pure Avatar Component */}
      <Avatar {...avatarProps} size={size} source={avatarUri} />

      {/* Picker Button Overlay */}
      <TouchableOpacity
        onPress={handleButtonPress}
        disabled={isSelectingImage}
        className={cn(
          'rounded-full items-center justify-center absolute border border-white',
          buttonConfig.button,
          buttonConfig.buttonPosition,
          hasAvatar ? 'bg-red' : 'bg-primary',
        )}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel={pickerButtonLabel}
        accessibilityRole="button"
        accessibilityHint={pickerButtonHint}
        accessibilityState={{
          disabled: isSelectingImage,
          busy: isSelectingImage,
        }}
        {...Platform.select({
          ios: {
            accessibilityTraits: ['button'],
          },
          android: {
            accessibilityComponentType: 'button',
          },
        })}
      >
        {hasAvatar ? (
          <CancelIcon
            width={buttonConfig.iconSize}
            height={buttonConfig.iconSize}
          />
        ) : (
          <AddIcon
            width={buttonConfig.iconSize}
            height={buttonConfig.iconSize}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

EditableAvatarBase.displayName = 'EditableAvatarBase';

/**
 * EditableAvatar with all HOCs composed
 *
 * @example
 * <EditableAvatar
 *   initialSource={avatar}
 *   onChangeImage={(uri) => updateProfile(uri)}
 *   size={92}
 * />
 */
export const EditableAvatar = withAvatarState(
  withCameraOption(EditableAvatarBase),
);

EditableAvatar.displayName = 'EditableAvatar';
