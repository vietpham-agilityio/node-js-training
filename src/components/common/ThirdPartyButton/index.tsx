import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

// Icons
import { FacebookIcon, GoogleIcon } from '@/icons';

export enum ThirdPartyButtonType {
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
}

interface ThirdPartyButtonProps {
  type: ThirdPartyButtonType;
  onPress: () => void;
}

export const ThirdPartyButton = memo(
  ({ type, onPress }: ThirdPartyButtonProps) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`login with ${type}`}
      className="w-16 h-16 bg-dark-blue rounded-full p-3.5 items-center justify-center"
    >
      <View className="w-9 h-8 items-center justify-center">
        {type === ThirdPartyButtonType.FACEBOOK ? (
          <FacebookIcon />
        ) : (
          <GoogleIcon />
        )}
      </View>
    </TouchableOpacity>
  ),
);

ThirdPartyButton.displayName = 'ThirdPartyButton';
