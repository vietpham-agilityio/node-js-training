import { memo, useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';

// Components
import { Typo } from '../Typo';

// Utils
import { cn } from '@/utils/cn';
import { isAndroid, isIOS } from '@/utils/platform';

export interface Tab {
  id: string;
  label: string;
}

export type Variant = 'primary' | 'secondary' | 'tertiary';

export const VARIANTS_MAP: Record<
  Variant,
  {
    container: string;
    tab: string;
    text: string;
    tabActive?: string;
  }
> = {
  primary: {
    container: 'items-start',
    tab: 'px-6 py-2 rounded-base items-center justify-center bg-bg-quaternary',
    tabActive: 'bg-gradient-to-r from-gradient-blue-start to-gradient-blue-end',
    text: 'font-montserrat-medium text-sm text-white',
  },
  secondary: {
    container: 'justify-center items-center',
    tab: 'pb-1 flex-1 items-center justify-center',
    text: 'font-montserrat-semibold text-base text-white/70',
  },
  tertiary: {
    container: 'justify-center items-center',
    tab: 'flex-1 py-2 items-center justify-center rounded-sm opacity-80',
    tabActive: 'bg-gradient-to-r from-secondary to-primary opacity-100',
    text: 'font-montserrat-regular text-lg',
  },
};

export const TabItem = memo(
  ({
    tab,
    isActive,
    onTabChange,
    variant,
  }: {
    tab: Tab;
    isActive: boolean;
    onTabChange: (tabId: string) => void;
    variant: Variant;
  }) => {
    const handlePress = useCallback(() => {
      onTabChange(tab.id);
    }, [onTabChange, tab.id]);

    return (
      <TouchableOpacity
        key={tab.id}
        testID={`tab-${tab.id}`}
        accessibilityRole="tab"
        accessibilityState={{
          selected: isActive,
          disabled: false,
        }}
        accessibilityLabel={tab.label}
        accessibilityHint={
          isActive
            ? `${tab.label} tab, currently active`
            : `Switch to ${tab.label} tab`
        }
        accessible
        {...(isAndroid() && {
          accessibilityLiveRegion: isActive ? 'polite' : 'none',
        })}
        {...(isIOS() && {
          accessibilityTraits: isActive ? ['selected', 'button'] : ['button'],
        })}
        className={cn(
          'relative',
          VARIANTS_MAP[variant].tab,
          isActive && VARIANTS_MAP[variant].tabActive,
        )}
        onPress={handlePress}
      >
        <Typo
          testID={`tab-text-${tab.id}`}
          className={cn(VARIANTS_MAP[variant].text, isActive && 'text-white')}
          accessibilityRole="text"
        >
          {tab.label}
        </Typo>
        {isActive && variant === 'secondary' && (
          <View
            testID={`tab-indicator-${tab.id}`}
            className="absolute bottom-0 right-0 h-[2px] left-1/2 -translate-x-1/2 bg-white rounded-full"
            accessible={false}
            importantForAccessibility="no"
          />
        )}
      </TouchableOpacity>
    );
  },
);

TabItem.displayName = 'TabItem';
