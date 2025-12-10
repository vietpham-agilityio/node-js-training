import { memo } from 'react';
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { useResolveClassNames } from 'uniwind';
import { Typo } from '..';

interface Tab {
  id: string;
  label: string;
}

type Variant = 'primary' | 'secondary';

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: Variant;
}

const VARIANTS_MAP: Record<
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
    tab: 'pb-1 flex-1 items-center justify-center ',
    text: 'font-montserrat-semibold text-base text-white/70',
  },
};

export const Tabs = memo(
  ({ tabs, activeTab, onTabChange, variant = 'primary' }: TabsProps) => {
    const activeTabLabel = tabs.find(tab => tab.id === activeTab)?.label || '';
    const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);
    const contentContainerStyles = useResolveClassNames(
      `gap-3 px-6 ${variant === 'secondary' && 'flex-1'}`,
    );

    return (
      <View
        testID="tabs-container"
        className={`bg-transparent ${VARIANTS_MAP[variant].container}`}
        accessibilityRole="tablist"
        accessibilityLabel={`Tab navigation with ${tabs.length} tabs`}
        accessibilityHint={`Currently on ${activeTabLabel} tab, ${activeTabIndex + 1} of ${tabs.length}`}
        accessible
        {...(Platform.OS === 'android' && {
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
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTab;

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
                {...(Platform.OS === 'android' && {
                  accessibilityLiveRegion: isActive ? 'polite' : 'none',
                })}
                {...(Platform.OS === 'ios' && {
                  accessibilityTraits: isActive
                    ? ['selected', 'button']
                    : ['button'],
                })}
                className={`${VARIANTS_MAP[variant].tab} ${isActive && VARIANTS_MAP[variant].tabActive} relative`}
                onPress={() => onTabChange(tab.id)}
              >
                <Typo
                  testID={`tab-text-${tab.id}`}
                  className={`${VARIANTS_MAP[variant].text} ${isActive && 'text-white'}`}
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
          })}
        </ScrollView>
      </View>
    );
  },
);

Tabs.displayName = 'Tabs';
