import { Divider, Typo } from '@/components/common';
import { ComponentType, memo } from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

interface SettingItemProps extends Omit<TouchableOpacityProps, 'children'> {
  testID?: string;
  icon?: ComponentType<SvgProps>;
  title: string;
}

export const SettingItem = memo(
  ({ testID, icon, title, ...props }: SettingItemProps) => {
    const Icon = icon;

    return (
      <TouchableOpacity
        testID={testID}
        className="w-full gap-3.5"
        accessible
        accessibilityLabel={`${title} setting`}
        accessibilityHint="Tap to open setting"
        {...props}
      >
        <View className="flex-row justify-start items-center">
          {Icon && <Icon width={24} height={24} />}
          <Typo size="base" weight="regular" className="ml-3">
            {title}
          </Typo>
        </View>

        <Divider className="border-b-2 border-dashed border-white/60 rounded-full" />
      </TouchableOpacity>
    );
  },
);

SettingItem.displayName = 'SettingItem';
