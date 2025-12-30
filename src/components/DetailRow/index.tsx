import { memo } from 'react';
import { View } from 'react-native';

// Components
import { Typo } from '../Typo';

interface DetailRowProps {
  label: string;
  value: string;
  valueClassName?: string;
  testID?: string;
}

export const DetailRow = memo(
  ({ label, value, valueClassName = '', testID }: DetailRowProps) => (
    <View className="flex-row justify-between items-center" testID={testID}>
      <Typo size="base" weight="regular" className="text-gradient-light">
        {label}
      </Typo>
      <Typo
        size="base"
        weight="regular"
        className={`text-white ${valueClassName}`}
      >
        {value}
      </Typo>
    </View>
  ),
);

DetailRow.displayName = 'DetailRow';
