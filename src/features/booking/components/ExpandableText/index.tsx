import { memo, useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Typo } from '@/components/Typo';
import { type FontSize, type FontWeight } from '@/components/Typo';

// Constants
import { TEXT_MAX_LENGTH } from '@/constants';

// Utils
import { cn } from '@/utils';

export interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  textSize?: FontSize;
  textWeight?: FontWeight;
  textClassName?: string;
  readMoreClassName?: string;
  containerClassName?: string;
  testID?: string;
}

const READ_TEXT_MAP = {
  MORE: 'Read more',
  LESS: 'Read less',
};

export const ExpandableText = memo(
  ({
    text,
    maxLength = TEXT_MAX_LENGTH,
    textSize = 'sm',
    textWeight = 'regular',
    textClassName = 'text-white/80',
    readMoreClassName = 'text-light-blue',
    containerClassName,
    testID,
  }: ExpandableTextProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const shouldShowReadMore = useMemo(
      () => text.length > maxLength,
      [text, maxLength],
    );

    const handleToggle = useCallback(() => {
      setIsExpanded(prev => !prev);
    }, []);

    const displayedText = useMemo(() => {
      if (!shouldShowReadMore || isExpanded) {
        return text;
      }
      return `${text.slice(0, maxLength)}... `;
    }, [text, maxLength, isExpanded, shouldShowReadMore]);

    const toggleLabel = isExpanded ? READ_TEXT_MAP.LESS : READ_TEXT_MAP.MORE;

    return (
      <View className={cn(containerClassName)} testID={testID}>
        <Text>
          <Typo size={textSize} weight={textWeight} className={textClassName}>
            {displayedText}
          </Typo>

          {shouldShowReadMore && (
            <Text
              onPress={handleToggle}
              accessible
              accessibilityRole="button"
              accessibilityLabel={toggleLabel}
              testID={testID ? `${testID}-toggle` : undefined}
            >
              <Typo
                size={textSize}
                weight="medium"
                className={readMoreClassName}
              >
                {toggleLabel}
              </Typo>
            </Text>
          )}
        </Text>
      </View>
    );
  },
);

ExpandableText.displayName = 'ExpandableText';
