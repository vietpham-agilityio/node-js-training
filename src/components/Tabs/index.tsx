import { memo } from 'react';
import { ScrollView, View } from 'react-native';
import { useResolveClassNames } from 'uniwind';

// Utils
import { cn } from '@/utils/cn';
import { isAndroid } from '@/utils/platform';

// Components
import { Tab, TabItem, Variant, VARIANTS_MAP } from './TabItem';

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: Variant;
}

export const Tabs = memo(
  ({ tabs, activeTab, onTabChange, variant = 'primary' }: TabsProps) => {
    const contentContainerStyles = useResolveClassNames(
      `gap-3 ${(variant === 'secondary' || variant === 'tertiary') && 'flex-1'}`,
    );

    return (
      <View
        testID="tabs-container"
        className={cn('bg-transparent', VARIANTS_MAP[variant].container)}
        {...(isAndroid() && {
          accessibilityLiveRegion: 'polite',
        })}
      >
        <ScrollView
          testID="tabs-scroll-view"
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={contentContainerStyles}
          accessibilityRole="none"
          accessible={false}
        >
          {tabs.map(tab => {
            const isActive = tab.id === activeTab;

            return (
              <TabItem
                key={tab.id}
                tab={tab}
                isActive={isActive}
                onTabChange={onTabChange}
                variant={variant}
              />
            );
          })}
        </ScrollView>
      </View>
    );
  },
);

Tabs.displayName = 'Tabs';
