import { memo } from 'react';
import { TouchableOpacity } from 'react-native';

// Icons
import { FacebookIcon } from '@/icons/FacebookIcon';
import { GoogleIcon } from '@/icons/GoogleIcon';

export enum ThirdPartyButtonType {
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
}

interface ThirdPartyButtonProps {
  isPending?: boolean;
  type: ThirdPartyButtonType;
  onPress: () => void;
  testID?: string;
}

export const ThirdPartyButton = memo(
  ({ isPending = false, type, onPress, testID }: ThirdPartyButtonProps) => (
    <TouchableOpacity
      disabled={isPending}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`login with ${type}`}
      accessibilityHint={`Authenticate using ${type}}`}
      className="w-16 h-16 bg-bg-quaternary rounded-full p-3.5 items-center justify-center"
      testID={testID}
    >
      {type === ThirdPartyButtonType.FACEBOOK ? (
        <FacebookIcon />
      ) : (
        <GoogleIcon />
      )}
    </TouchableOpacity>
  ),
);

ThirdPartyButton.displayName = 'ThirdPartyButton';
