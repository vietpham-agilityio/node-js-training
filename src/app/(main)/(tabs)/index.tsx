import { useCallback, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Expo
import { router } from 'expo-router';

// Unwind
import { useResolveClassNames } from 'uniwind';

// Constants
import { ERROR_MESSAGES, FILTER_CATEGORY_TABS, MESSAGES } from '@/constants';

// Components
import { Button, SearchInput, Tabs } from '@/components/common';
import {
  MovieBannerCarousel,
  MovieTrailerCarousel,
  PromotionCard,
} from '@/components/feature';

// Hooks
import { useAuth } from '@/hooks';

// Types
import { MOVIES_MOCK } from '@/mocks';

const HomeScreen = () => {
  const { signOut } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>(
    FILTER_CATEGORY_TABS[0].id,
  );

  const promotions = [
    {
      id: '1',
      title: 'Student Holiday',
      subtitle: 'Maximal only for two people',
      discount: '50%',
    },
    {
      id: '2',
      title: 'Student Holiday',
      subtitle: 'Maximal only for two people',
      discount: '50%',
    },
    {
      id: '3',
      title: 'Student Holiday',
      subtitle: 'Maximal only for two people',
      discount: '50%',
    },
  ];

  const [searchValue, setSearchValue] = useState('');

  const handleSearch = useCallback((text: string) => {
    setSearchValue(text);
  }, []);

  const containerStyles = useResolveClassNames('flex-1');

  const handleSignOut = () => {
    Alert.alert(MESSAGES.SIGN_OUT, MESSAGES.SIGN_OUT_MESSAGE, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert(ERROR_MESSAGES.SIGN_OUT_FAILED);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      edges={['top']}
      accessibilityLabel="Home screen"
      accessibilityHint="Home screen"
      style={containerStyles}
    >
      <ScrollView
        className=" h-full bg-dark-blue"
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mt-22">
          <SearchInput value={searchValue} onChangeText={handleSearch} />
        </View>

        <View className="h-10 mt-7">
          <Tabs
            tabs={FILTER_CATEGORY_TABS}
            activeTab={activeCategory}
            onTabChange={setActiveCategory}
          />
        </View>

        <View className="mt-7">
          <MovieBannerCarousel movies={MOVIES_MOCK} />
          <MovieBannerCarousel movies={MOVIES_MOCK} variant="vertical" />
          <MovieTrailerCarousel
            trailers={[
              ...MOVIES_MOCK[0].trailerUrl,
              ...MOVIES_MOCK[1].trailerUrl,
              ...MOVIES_MOCK[2].trailerUrl,
            ]}
          />
        </View>

        <View className="w-full flex-1 gap-4 mt-7">
          {promotions.map(promotion => (
            <PromotionCard key={promotion.id} {...promotion} />
          ))}
        </View>
        <Button
          title=" Sign Out"
          onPress={handleSignOut}
          className="bg-error rounded-xl p-4"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
