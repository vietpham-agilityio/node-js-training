import { Link } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { withUniwind } from 'uniwind';

// Constants
import { FILTER_CATEGORY_TABS, HEADER_HEIGHT, ROUTES } from '@/constants';

// Components
import { SearchInput, Tabs, Typo } from '@/components/common';
import { MovieBannerCarousel, PromotionCard } from '@/components/feature';

// Types
import { MOCK_PROMOTIONS, MOVIES_MOCK } from '@/mocks';

const StyledSafeAreaView = withUniwind(SafeAreaView);

const HomeScreen = () => {
  const [activeCategory, setActiveCategory] = useState<string>(
    FILTER_CATEGORY_TABS[0].id,
  );

  const [searchValue, setSearchValue] = useState('');

  const handleSearch = useCallback((text: string) => {
    setSearchValue(text);
  }, []);

  return (
    <StyledSafeAreaView
      edges={['top']}
      accessibilityLabel="Home screen"
      accessibilityHint="Home screen"
      className="flex-1 bg-bg-primary"
      style={{
        marginTop: HEADER_HEIGHT,
      }}
    >
      <ScrollView className="h-full mb-6" showsVerticalScrollIndicator={false}>
        <View className="px-6">
          <SearchInput
            value={searchValue}
            onChangeText={handleSearch}
            inputClassName="border-0"
          />
        </View>

        <View className="mt-7">
          <Tabs
            tabs={FILTER_CATEGORY_TABS}
            activeTab={activeCategory}
            onTabChange={setActiveCategory}
          />
        </View>

        <View className="mt-7 gap-2">
          <Typo size="xl" weight="semibold" className="px-6">
            Now Playing
          </Typo>
          <MovieBannerCarousel movies={MOVIES_MOCK} />
        </View>

        <View className="gap-7">
          <Typo size="xl" weight="semibold" className="px-6">
            Coming Soon
          </Typo>
          <MovieBannerCarousel movies={MOVIES_MOCK} variant="vertical" />
        </View>

        <View className="px-6 gap-4 mt-7">
          <View className="flex-row justify-between items-center">
            <Typo size="xl" weight="semibold">
              Promotions
            </Typo>
            <Link href={ROUTES.HOME}>
              <Typo size="sm" weight="medium" className="text-text-currency">
                See all
              </Typo>
            </Link>
          </View>
          {MOCK_PROMOTIONS.map(promotion => (
            <PromotionCard key={promotion.id} {...promotion} />
          ))}
        </View>
      </ScrollView>
    </StyledSafeAreaView>
  );
};

export default HomeScreen;
