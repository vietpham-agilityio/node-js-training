import { memo } from 'react';
import { View } from 'react-native';

// Components
import { Typo } from '../Typo';

interface OrderDetailRowProps {
  label: string;
  value: string;
  valueClassName?: string;
  testID?: string;
}

export const OrderDetailRow = memo(
  ({ label, value, valueClassName = '', testID }: OrderDetailRowProps) => (
    <View className="flex-row justify-between items-center" testID={testID}>
      <Typo size="base" weight="regular" className="text-gradient-white">
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

OrderDetailRow.displayName = 'OrderDetailRow';
